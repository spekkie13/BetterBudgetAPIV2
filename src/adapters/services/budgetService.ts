import {makeBudgetRepo} from "@/adapters/repo/budgetRepo";
import {TeamScopedServiceBase} from "@/adapters/services/factory/teamScopedServiceBase";
import {db} from "@/db/client";
import {budgets, categories} from "@/db/schema";
import {and, desc, eq, inArray, lte} from "drizzle-orm";
import {BudgetInsert, BudgetPatch, BudgetRow, makeBudgetKey} from "@/db/types/budgetTypes";

type EnsureOpts = {
    horizonMonths?: number          // default 12
    defaultWhenNoHistory?: number   // default 0 (insert 0 when no prior budget exists)
    includeArchivedCategories?: boolean // if you have a deleted/archived flag
}

const pad = (n: number) => String(n).padStart(2, '0');
const yyyymm01 = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-01`;

export class BudgetService extends TeamScopedServiceBase<BudgetRow, number, number, BudgetInsert, BudgetPatch> {
    constructor(){
        super(makeBudgetRepo())
    }

    async selectByMonth(teamId: number, month: string, categoryId: number): Promise<BudgetRow | null> {
        const key = makeBudgetKey(teamId, categoryId, month);

        const rows = await db
            .select()
            .from(budgets)
            .where(and(
                eq(budgets.teamId, key.teamId),
                eq(budgets.categoryId, key.categoryId),
                eq(budgets.periodMonth, key.periodMonth),
            ))
            .limit(1);
        return rows[0] ?? null;
    }

    async ensureBudgetsForAllCategories(
        teamId: number,
        fromMonth: Date,
        opts: EnsureOpts = {}
    ) {
        const horizon = opts.horizonMonths ?? 12
        const defaultWhenNoHistory = opts.defaultWhenNoHistory ?? 0

        // ✅ Use helper
        const months = generateMonthSeries(fromMonth, horizon)
        if (months.length === 0) return

        const monthKeys = months.map(yyyymm01)
        const endStr = monthKeys[monthKeys.length - 1]

        await db.transaction(async (tx) => {
            //await tx.execute(sql`SELECT pg_advisory_xact_lock(${teamId})`)

            // 1️⃣ All categories in team
            const catRows = await tx
                .select({ id: categories.id })
                .from(categories)
                .where(eq(categories.teamId, teamId))
            if (catRows.length === 0) return
            const categoryIds = catRows.map(c => c.id)

            // 2️⃣ Existing budget rows within horizon
            const existing = await tx
                .select({ categoryId: budgets.categoryId, periodMonth: budgets.periodMonth })
                .from(budgets)
                .where(
                    and(
                        eq(budgets.teamId, teamId),
                        inArray(budgets.categoryId, categoryIds),
                        inArray(budgets.periodMonth, monthKeys)
                    )
                )

            const exists = new Set<string>()
            const keyOf = (catId: number, monthStr: string) => `${catId}|${monthStr}`
            for (const r of existing) {
                exists.add(keyOf(r.categoryId, (r.periodMonth as string).slice(0, 10)))
            }

            // 3️⃣ History up to last month
            const hist = await tx
                .select({
                    categoryId: budgets.categoryId,
                    periodMonth: budgets.periodMonth,
                    amountCents: budgets.amountCents,
                    rollover: budgets.rollover,
                })
                .from(budgets)
                .where(
                    and(
                        eq(budgets.teamId, teamId),
                        inArray(budgets.categoryId, categoryIds),
                        lte(budgets.periodMonth, endStr)
                    )
                )
                .orderBy(budgets.categoryId, desc(budgets.periodMonth))

            const byCat = new Map<number, { periodMonth: string; amountCents: number; rollover: boolean }[]>()
            for (const h of hist) {
                const arr = byCat.get(h.categoryId) ?? []
                arr.push({
                    periodMonth: (h.periodMonth as string).slice(0, 10),
                    amountCents: Number(h.amountCents),
                    rollover: Boolean(h.rollover),
                })
                byCat.set(h.categoryId, arr)
            }

            // 4️⃣ Compute missing rows
            const rows: {
                teamId: number
                categoryId: number
                periodMonth: string
                amountCents: number
                rollover: boolean
            }[] = []

            for (const catId of categoryIds) {
                const history = byCat.get(catId) ?? []
                for (const mStr of monthKeys) {
                    const key = keyOf(catId, mStr)
                    if (exists.has(key)) continue

                    const found = history.find(h => h.periodMonth <= mStr)
                    const amount = found ? found.amountCents : defaultWhenNoHistory
                    const rollover = found ? found.rollover : false

                    rows.push({ teamId, categoryId: catId, periodMonth: mStr, amountCents: amount, rollover })
                }
            }

            if (rows.length === 0) return

            // 5️⃣ Insert idempotently
            await tx.insert(budgets).values(rows as any).onConflictDoNothing()
        })
    }
}

function generateMonthSeries(fromMonth: Date, horizonMonths: number): Date[] {
    const start = firstOfMonthUTC(fromMonth);
    const n = Math.max(0, Math.floor(horizonMonths));
    const out: Date[] = [];
    for (let i = 0; i < n; i++) {
        out.push(addMonthsUTC(start, i));
    }
    return out;
}

function firstOfMonthUTC(d: Date): Date {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function addMonthsUTC(firstOfMonth: Date, n: number): Date {
    // assumes input is already first-of-month UTC
    return new Date(Date.UTC(firstOfMonth.getUTCFullYear(), firstOfMonth.getUTCMonth() + n, 1, 0, 0, 0, 0));
}
