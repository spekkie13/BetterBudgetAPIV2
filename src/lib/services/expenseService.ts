import {db} from "@/lib/db/client";
import {expenses} from "@/lib/db/schema";
import {and, desc, eq, gte, lte} from "drizzle-orm";

export async function getExpenseById(userId: number, id: number) {
    const result = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
        .limit(1)

    return result[0] ?? null;
}

export async function getAllExpenses(userId: number) {
    const result = await db
        .select()
        .from(expenses)
        .where(eq(expenses.userId, userId))

    return result ?? null;
}

export async function getExpensesByCategory(userId: number, categoryId: number) {
    const result = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.userId, userId), eq(expenses.categoryId, categoryId)))

    return result ?? null;
}

export async function getExpensesByUserAndPeriod(userId: number, period: { startDate: Date, endDate: Date }) {
    const result = await db
        .select()
        .from(expenses)
        .where(
            and(
                eq(expenses.userId, userId),
                gte(expenses.date, period.startDate),
                lte(expenses.date, period.endDate)
            )
        );

    return result ?? null;
}

export async function getExpensesByUserAndCategoryAndPeriod(userId: number, categoryId: number, period: { startDate: Date, endDate: Date}) {
    const result = await db
        .select()
        .from(expenses)
        .where(and(
            eq(expenses.userId, userId),
            eq(expenses.categoryId, categoryId),
            gte(expenses.date, period.startDate),
            lte(expenses.date, period.endDate)
        ))

    return result ?? null;
}

//Get most recent expense for a user and category
export async function getMostRecentExpense(userId: number, categoryId: number) {
    const result = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.userId, userId), eq(expenses.categoryId, categoryId)))
        .orderBy(desc(expenses.date))
        .limit(1)

    return result[0] ?? null;
}

// Get all expenses by category to derive distinct periods (not grouped here)
export async function getExpenseDatesByCategory(userId: number, categoryId: number) {
    const result = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.userId, userId), eq(expenses.categoryId, categoryId)))
        .orderBy(desc(expenses.date))

    return result ?? null;
}

// Create an expense
export async function createExpense(data: {
    description: string;
    amount: number | string;
    date: Date | string;
    isRecurring: boolean;
    userId: number;
    categoryId: number;
}) {
    console.log(data.date)
    const actualDate = new Date(data.date);

    const [createdExpense] = await db
        .insert(expenses)
        .values({
            description: data.description,
            amount: data.amount.toString(),
            date: actualDate,
            isRecurring: data.isRecurring ? 1 : 0,
            userId: data.userId,
            categoryId: data.categoryId,
        })
        .returning({
            id: expenses.id,
            description: expenses.description,
            amount: expenses.amount,
            date: expenses.date,
            isRecurring: expenses.isRecurring,
            categoryId: expenses.categoryId,
            userId: expenses.userId,
        });

    return createdExpense;
}

// Update an expense
export async function updateExpense(data: {
    id: number;
    description?: string;
    amount?: number;
    date?: Date;
    userId?: number;
    categoryId?: number;
}) {
    // Build update object dynamically and convert amount to string if needed
    const updateData: Record<string, any> = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = data.date;
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    const [updated] = await db
        .update(expenses)
        .set(updateData)
        .where(eq(expenses.id, data.id))
        .returning();

    return updated;
}

// Delete an expense by ID
export async function deleteExpenseById(id: number) {
    await db.delete(expenses).where(eq(expenses.id, id));
}
