// lib/db/repos/budgetRepo.ts
import { db } from '@/lib/db/client';
import { budgets as budget } from '@/lib/db/schema';
import { and, asc, eq } from 'drizzle-orm';
import type { BudgetInsert, BudgetRow, BudgetKey } from '@/lib/domain/budget';

export async function selectAllByTeam(teamId: number): Promise<BudgetRow[]> {
    return db.select().from(budget).where(eq(budget.teamId, teamId));
}

export async function selectByTeamAndId(teamId: number, id: number): Promise<BudgetRow | null> {
    const rows = await db
        .select()
        .from(budget)
        .where(and(eq(budget.id, id), eq(budget.teamId, teamId)))
        .limit(1);
    return rows[0] ?? null;
}

export async function selectByKey(key: BudgetKey): Promise<BudgetRow | null> {
    const rows = await db
        .select()
        .from(budget)
        .where(and(
            eq(budget.teamId, key.teamId),
            eq(budget.categoryId, key.categoryId),
            eq(budget.periodMonth, key.periodMonth),
        ))
        .limit(1);
    return rows[0] ?? null;
}

export async function selectByCategory(teamId: number, categoryId: number): Promise<BudgetRow[]> {
    return db
        .select()
        .from(budget)
        .where(and(eq(budget.teamId, teamId), eq(budget.categoryId, categoryId)));
}

export async function selectByMonth(teamId: number, periodMonth: string): Promise<BudgetRow[]> {
    return db
        .select()
        .from(budget)
        .where(and(eq(budget.teamId, teamId), eq(budget.periodMonth, periodMonth)))
        .orderBy(asc(budget.categoryId));
}

export async function insert(values: BudgetInsert): Promise<BudgetRow> {
    const [created] = await db.insert(budget).values(values).returning();
    return created;
}

export async function upsert(values: BudgetInsert): Promise<BudgetRow | null> {
    const [row] = await db
        .insert(budget)
        .values(values)
        .onConflictDoUpdate({
            target: [budget.id],
            set: {
                teamId: values.teamId,
                categoryId: values.categoryId,
                periodMonth: values.periodMonth,
                amountCents: values.amountCents,
                rollover: values.rollover,
            },
        })
        .returning();
    return row;
}

export async function deleteById(teamId: number, id: number): Promise<void> {
    await db.delete(budget).where(and(eq(budget.id, id), eq(budget.teamId, teamId)));
}
