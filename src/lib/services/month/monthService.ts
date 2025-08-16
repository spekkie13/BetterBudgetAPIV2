// services/monthService.ts
import { db } from '@/lib/db/client';
import { budgets as budget, transactions as txn, accounts, categories } from '@/lib/db/schema';
import { and, desc, eq, gte, lt, lte, isNull, inArray } from 'drizzle-orm';
import { toYmd } from '@/lib/utils/date';
import { toCents } from '@/lib/shared/helpers'

// --- utils ---
const monthStart = (d: Date | string) => {
    const x = new Date(d);
    return new Date(Date.UTC(x.getUTCFullYear(), x.getUTCMonth(), 1)); // 00:00 UTC
};
export const calculateMonthRange = (date: Date) => {
    const start = monthStart(date);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)); // exclusive end
    return { startDate: start, endDate: end };
};

// =============== READS (based on budgets) =================

// 2nd most recent month that has any budget rows (distinct by month)
export async function getSecondMostRecentBudgetMonth(teamId: number) {
    const rows = await db
        .select({ periodMonth: budget.periodMonth })
        .from(budget)
        .where(eq(budget.teamId, teamId))
        .groupBy(budget.periodMonth) // DISTINCT by month
        .orderBy(desc(budget.periodMonth))
        .limit(2);

    // periodMonth is a DATE column mapped as string (YYYY-MM-DD)
    return rows[1]?.periodMonth ?? null;
}

// budget month equal to or before given date (max month <= date)
export async function getBudgetMonthByDate(teamId: number, date: Date) {
    const ymd = toYmd(monthStart(date));
    const rows = await db
        .select({ periodMonth: budget.periodMonth })
        .from(budget)
        .where(and(eq(budget.teamId, teamId), lte(budget.periodMonth, ymd)))
        .groupBy(budget.periodMonth)
        .orderBy(desc(budget.periodMonth))
        .limit(1);

    return rows[0]?.periodMonth ?? null;
}

// exact month by its start date (YYYY-MM-01)
export async function getBudgetMonthByStartDate(teamId: number, startDateInput: Date | string) {
    const ymd = toYmd(monthStart(startDateInput));
    const rows = await db
        .select({ periodMonth: budget.periodMonth })
        .from(budget)
        .where(and(eq(budget.teamId, teamId), eq(budget.periodMonth, ymd)))
        .limit(1);

    return rows[0]?.periodMonth ?? null;
}

// =============== WRITES / ENSURE =================

/**
 * Ensure a month "exists" (optionally seed zero budgets for all team categories).
 * Returns the normalized month start (Date at 00:00 UTC).
 */
export async function ensureBudgetMonth(
    teamId: number,
    month: string | Date,
    opts?: { seedZeroBudgets?: boolean }
) {
    const start = typeof month === 'string' ? monthStart(`${month}-01`) : monthStart(month);
    const ymd = toYmd(start);

    if (opts?.seedZeroBudgets) {
        // 1) Load all team categories
        const cats = await db
            .select({ id: categories.id })
            .from(categories)
            .where(eq(categories.teamId, teamId));

        const catIds = cats.map(c => c.id);
        if (catIds.length) {
            // 2) Load which of those already have a budget row for this month
            const existing = await db
                .select({ categoryId: budget.categoryId })
                .from(budget)
                .where(and(eq(budget.teamId, teamId), eq(budget.periodMonth, ymd), inArray(budget.categoryId, catIds)));

            const existingIds = new Set(existing.map(e => e.categoryId));
            const missing = catIds.filter(id => !existingIds.has(id));

            // 3) Insert missing as zero budgets (onConflictDoNothing for safety)
            if (missing.length) {
                await db
                    .insert(budget)
                    .values(
                        missing.map(categoryId => ({
                            teamId,
                            categoryId,
                            periodMonth: ymd,
                            amountCents: 0,
                            rollover: false,
                        }))
                    )
                    .onConflictDoNothing({ target: [budget.teamId, budget.categoryId, budget.periodMonth] });
            }
        }
    }

    return new Date(`${ymd}T00:00:00Z`);
}

// =============== OPTIONAL: Opening balance helper =================
/**
 * Create a single "Opening balance" txn on the first day of the month if it doesn't exist yet.
 */
export async function createOpeningBalanceIfNotExists(params: {
    teamId: number;
    accountId: number;
    month: string | Date; // "YYYY-MM" or Date
    amount: number | string;
    createdBy?: number | null;
}) {
    const start = typeof params.month === 'string' ? monthStart(`${params.month}-01`) : monthStart(params.month);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));

    // idempotency: check if one exists
    const existing = await db
        .select({ id: txn.id })
        .from(txn)
        .where(
            and(
                eq(txn.teamId, params.teamId),
                eq(txn.accountId, params.accountId),
                gte(txn.postedAt, start),
                lt(txn.postedAt, end),
                eq(txn.memo, 'Opening balance'),
                isNull(txn.deletedAt)
            )
        )
        .limit(1);

    if (existing[0]) return null;

    // resolve currency from account
    const [acct] = await db
        .select({ currency: accounts.currency })
        .from(accounts)
        .where(eq(accounts.id, params.accountId))
        .limit(1);
    const currency = acct?.currency as any;

    const [created] = await db
        .insert(txn)
        .values({
            teamId: params.teamId,
            accountId: params.accountId,
            amountCents: toCents(Number(params.amount)),
            currency,
            postedAt: start,
            payee: null,
            memo: 'Opening balance',
            categoryId: null,
            isTransfer: false,
            createdBy: params.createdBy ?? null,
        })
        .returning();

    return created;
}
