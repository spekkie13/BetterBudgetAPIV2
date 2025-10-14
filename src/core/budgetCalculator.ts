import { BudgetService } from "@/adapters/services/budgetService";
import { addMonthsStr } from "@/core/date";
import { db } from "@/db/client";
import {and, eq, gte, inArray, isNull, lt, sql} from "drizzle-orm";
import { budgetCarryovers } from "@/db/schema/budgetCarryovers";
import {transactionSplits, txn} from "@/db/schema";

export type SpentMap = Map<number, number>;

const svc = new BudgetService();

export async function calcSpentByCategory(
    tx: any,
    teamId: number,
    windowFrom: string,
    windowTo: string,
    categoryIds: number[],
) : Promise<SpentMap> {
    const out = new Map<number, number>()
    if (!categoryIds || categoryIds.length === 0) return out

    // 1) Aggregate from SPLITS (joined to their parent transactions)
    const splitRows = await tx
        .select({
            categoryId: transactionSplits.categoryId,
            spent: sql<number>`SUM(CASE WHEN ${transactionSplits.amountCents} < 0 THEN -${transactionSplits.amountCents} ELSE 0 END)`,
        })
        .from(transactionSplits)
        .innerJoin(txn, eq(transactionSplits.txnId, txn.id))
        .where(and(
            eq(txn.teamId, teamId),
            isNull(txn.deletedAt),
            eq(txn.isTransfer, false),
            gte(txn.postedAt as any, windowFrom as any),
            lt(txn.postedAt as any, windowTo as any),
            inArray(transactionSplits.categoryId, categoryIds),
        ))
        .groupBy(transactionSplits.categoryId)

    for (const r of splitRows) {
        const cid = Number(r.categoryId)
        const v = Number(r.spent) || 0
        out.set(cid, (out.get(cid) ?? 0) + v)
    }

    // 2) Aggregate from UNSPLIT transactions (no split rows exist for that txn)
    //    We exclude any txn that has at least one split via NOT EXISTS subquery.
    const baseRows = await tx
        .select({
            categoryId: txn.categoryId,
            spent: sql<number>`SUM(CASE WHEN ${txn.amountCents} < 0 THEN -${txn.amountCents} ELSE 0 END)`,
        })
        .from(txn)
        .where(and(
            eq(txn.teamId, teamId),
            isNull(txn.deletedAt),
            eq(txn.isTransfer, false),
            gte(txn.postedAt as any, windowFrom as any),
            lt(txn.postedAt as any, windowTo as any),
            inArray(txn.categoryId, categoryIds),
            // NOT EXISTS (SELECT 1 FROM transaction_splits s WHERE s.txn_id = txn.id)
            sql`NOT EXISTS (SELECT 1 FROM "transaction_splits" s WHERE s.txn_id = ${txn.id})`,
        ))
        .groupBy(txn.categoryId)

    for (const r of baseRows) {
        const cid = Number(r.categoryId)
        const v = Number(r.spent) || 0
        out.set(cid, (out.get(cid) ?? 0) + v)
    }

    return out
}


export type MonthBudget = {
    categoryId: number;
    amountCents: number;
    rollover: boolean;
}

export async function fetchMonthBudgets(tx: any, teamId: number, monthStr: string): Promise<MonthBudget[]> {
    let budgets = await svc.selectAllByTeam(teamId);
    budgets = budgets.filter((budget) => budget.periodMonth === monthStr);
    const result: MonthBudget[] = [];

    for (const budget of budgets) {
        result.push({
            categoryId: budget.categoryId,
            amountCents: budget.amountCents,
            rollover: budget.rollover,
        });
    }

    return result;
}

export async function applyRolloverForMonth(teamId: number, fromMonthStr: string) {
    const nextMonthStr = addMonthsStr(fromMonthStr, 1);

    await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(${teamId})`);

        await svc.ensureBudgetsForAllCategories(teamId, nextMonthStr, { horizonMonths: 1 });

        const monthBudgets = await fetchMonthBudgets(tx, teamId, fromMonthStr);
        const rollCats = monthBudgets.filter(b => b.rollover);
        if (rollCats.length === 0) return;

        const categoryIds = rollCats.map(r => r.categoryId);

        const spentMap = await calcSpentByCategory(tx, teamId, fromMonthStr, nextMonthStr, categoryIds);

        for (const budget of rollCats) {
            const spent = spentMap.get(budget.categoryId) ?? 0;
            const surplus = Math.max(0, budget.amountCents - spent);
            if (surplus <= 0) continue;

            await tx.insert(budgetCarryovers)
                .values({
                    teamId: teamId,
                    categoryId: budget.categoryId,
                    fromMonth: fromMonthStr,
                    toMonth:   nextMonthStr,
                    amountCents: surplus,
                })
                .onConflictDoNothing()

            await tx.execute(sql`
                UPDATE "budget" b
                SET amount_cents = (
                      COALESCE((
                        SELECT MIN(b2.amount_cents)::bigint
                        FROM "budget" b2
                        WHERE b2.team_id = ${teamId}
                          AND b2.category_id = ${budget.categoryId}
                          AND b2.period_month = ${nextMonthStr}
                      ), 0)
                      +
                      COALESCE((
                        SELECT SUM(c.amount_cents)::bigint
                        FROM "budget_carryover" c
                        WHERE c.team_id = ${teamId}
                          AND c.category_id = ${budget.categoryId}
                          AND c.to_month = ${nextMonthStr}
                      ), 0)
                )
                WHERE b.team_id = ${teamId}
                  AND b.category_id = ${budget.categoryId}
                  AND b.period_month = ${nextMonthStr}
          `)

        }
    })
}
