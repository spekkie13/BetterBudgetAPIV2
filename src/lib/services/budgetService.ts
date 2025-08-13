// services/budgetService.ts
import { db } from '@/lib/db/client';
import { budgets as budget } from '@/lib/db/schema';
import { and, asc, eq, InferSelectModel, InferInsertModel } from 'drizzle-orm';

// ---------- helpers ----------
const toCents = (n: number | string) => Math.round(Number(n) * 100);

// Accepts "YYYY-MM" or Date and returns "YYYY-MM-01"
function normalizeMonthInput(input: string | Date): string {
    if (typeof input === 'string') {
        // assume "YYYY-MM"
        return `${input}-01`;
    }
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}

// ---------- types ----------
export type BudgetRow = InferSelectModel<typeof budget>;
export type BudgetInsert = InferInsertModel<typeof budget>;

// =============== READS ===============

export async function getAllBudgets(teamId: number): Promise<BudgetRow[]> {
    return db.select().from(budget).where(eq(budget.teamId, teamId));
}

export async function getBudgetById(teamId: number, id: number): Promise<BudgetRow | null> {
    const rows = await db
        .select()
        .from(budget)
        .where(and(eq(budget.id, id), eq(budget.teamId, teamId)))
        .limit(1);
    return rows[0] ?? null;
}

export async function getBudgetByMonthAndCategory(
    teamId: number,
    month: string | Date,
    categoryId: number
): Promise<BudgetRow | null> {
    const periodMonth = normalizeMonthInput(month);
    const rows = await db
        .select()
        .from(budget)
        .where(and(
            eq(budget.teamId, teamId),
            eq(budget.categoryId, categoryId),
            eq(budget.periodMonth, periodMonth),
        ))
        .limit(1);
    return rows[0] ?? null;
}

export async function getBudgetsByCategory(teamId: number, categoryId: number): Promise<BudgetRow[]> {
    return db
        .select()
        .from(budget)
        .where(and(eq(budget.teamId, teamId), eq(budget.categoryId, categoryId)));
}

export async function getBudgetsByMonth(teamId: number, month: string | Date): Promise<BudgetRow[]> {
    const periodMonth = normalizeMonthInput(month);
    return db
        .select()
        .from(budget)
        .where(and(eq(budget.teamId, teamId), eq(budget.periodMonth, periodMonth)))
        .orderBy(asc(budget.categoryId));
}

// =============== WRITES ===============

export async function createBudget(data: {
    teamId: number;
    categoryId: number;
    month: string | Date;   // "YYYY-MM" or Date
    amount: number;         // major units
    rollover?: boolean;
}): Promise<BudgetRow> {
    const periodMonth = normalizeMonthInput(data.month);
    const [created] = await db
        .insert(budget)
        .values({
            teamId: data.teamId,
            categoryId: data.categoryId,
            periodMonth,
            amountCents: toCents(data.amount),
            rollover: data.rollover ?? false,
        })
        .returning();
    return created;
}

/** Upsert on (team_id, category_id, period_month) */
export async function upsertBudget(data: {
    teamId: number;
    categoryId: number;
    month: string | Date;  // "YYYY-MM" or Date
    amount: number;        // major units
    rollover?: boolean;
}): Promise<BudgetRow> {
    const periodMonth = normalizeMonthInput(data.month);
    const values: BudgetInsert = {
        teamId: data.teamId,
        categoryId: data.categoryId,
        periodMonth,
        amountCents: toCents(data.amount),
        rollover: data.rollover ?? false,
    };

    const [row] = await db
        .insert(budget)
        .values(values)
        .onConflictDoUpdate({
            target: [budget.teamId, budget.categoryId, budget.periodMonth],
            set: {
                amountCents: values.amountCents,
                rollover: values.rollover ?? false,
            },
        })
        .returning();

    return row;
}

export async function updateBudget(data: {
    id: number;
    teamId: number;          // guard updates by team
    amount?: number;         // major units
    month?: string | Date;   // move to another month
    categoryId?: number;     // reassign to another category
    rollover?: boolean;
}): Promise<BudgetRow | null> {
    const patch: Partial<BudgetInsert> = {};
    if (data.amount !== undefined) patch.amountCents = toCents(data.amount);
    if (data.month !== undefined) patch.periodMonth = normalizeMonthInput(data.month);
    if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
    if (data.rollover !== undefined) patch.rollover = data.rollover;

    const [updated] = await db
        .update(budget)
        .set(patch)
        .where(and(eq(budget.id, data.id), eq(budget.teamId, data.teamId)))
        .returning({
            id: budget.id,
            teamId: budget.teamId,
            categoryId: budget.categoryId,
            periodMonth: budget.periodMonth,
            amountCents: budget.amountCents,
            rollover: budget.rollover,
        });

    return updated ?? null;
}

export async function deleteBudgetById(teamId: number, id: number): Promise<void> {
    await db.delete(budget).where(and(eq(budget.id, id), eq(budget.teamId, teamId)));
}

/** Convenience helper for legacy flow */
export async function createBudgetIfNotExists(params: {
    teamId: number;
    categoryId: number;
    month: string | Date;   // "YYYY-MM" or Date
    amount?: number;
    rollover?: boolean;
}): Promise<BudgetRow> {
    const existing = await getBudgetByMonthAndCategory(params.teamId, params.month, params.categoryId);
    if (existing) return existing;
    return upsertBudget({
        teamId: params.teamId,
        categoryId: params.categoryId,
        month: params.month,
        amount: params.amount ?? 0,
        rollover: params.rollover ?? false,
    });
}
