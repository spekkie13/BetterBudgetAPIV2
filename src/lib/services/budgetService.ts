import { db } from '@/lib/db/client'; // this is your Drizzle instance
import {budgets} from '@/lib/db/schema';
import {and, asc, eq} from "drizzle-orm"; // the schema you defined

// ✅ Get a single budget by ID and userId (using findFirst for compound filter)
export async function getBudgetById(userId: number, id: number) {
    const result = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.id, id), eq(budgets.userId, userId)))
        .limit(1);

    return result[0] ?? null;
}

// ✅ Get budget for a given category and period for the user
export async function getBudgetByPeriodAndCategory(userId: number, periodId: number, categoryId: number) {
    const result = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.categoryId, categoryId), eq(budgets.periodId, periodId)))
        .limit(1)

    return result[0] ?? null;
}

// ✅ Get all budgets by categoryId
export async function getBudgetsByCategoryId(userId: number, categoryId: number) {
    const result = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.categoryId, categoryId)))

    return result ?? null;
}

// ✅ Get all budgets by periodId
export async function getBudgetsByPeriodId(userId: number, periodId: number) {
    const result = await db
        .select()
        .from(budgets)
        .where(and(eq(budgets.userId, userId), eq(budgets.periodId, periodId)))
        .orderBy(asc(budgets.categoryId))

    return result ?? null;
}

export async function createBudget(data: {
    amount: number;
    userId: number;
    categoryId: number;
    periodId: number;
}) {
    const [createdBudget] = await db
        .insert(budgets)
        .values({
            amount: data.amount.toString(),
            userId: data.userId,
            categoryId: data.categoryId,
            periodId: data.periodId,
        })
        .returning({
            id: budgets.id,
            amount: budgets.amount,
            userId: budgets.userId,
            categoryId: budgets.categoryId,
            periodId: budgets.periodId,
        });

    return createdBudget;
}


// ✅ Delete one budget by ID (use delete if id is unique)
export async function deleteBudgetById(id: number) {
    await db.delete(budgets).where(eq(budgets.id, id));
}

// ✅ Update a budget by ID
export async function updateBudget(data: {
    id: number;
    amount?: number;
    userId?: number;
    categoryId?: number;
    periodId?: number;
}) {
    // Build update object dynamically and convert amount to string if needed
    const updateData: Record<string, any> = {};
    if (data.amount !== undefined) updateData.amount = data.amount.toString(); // Convert decimal to string
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.periodId !== undefined) updateData.periodId = data.periodId;

    const [updated] = await db
        .update(budgets)
        .set(updateData)
        .where(eq(budgets.id, data.id))
        .returning();

    return updated;
}
