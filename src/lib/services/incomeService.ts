import {db} from "@/lib/db/client";
import {incomes} from "@/lib/db/schema";
import {and, eq, gte, lt} from "drizzle-orm";

export async function getIncomesByPeriod(userId: number, period: { startDate: Date, endDate: Date }) {
    const result = await db
        .select()
        .from(incomes)
        .where(and(
            eq(incomes.userId, userId),
            gte(incomes.date, period.startDate),
            lt(incomes.date, period.endDate)
        ))

    return result ?? null;
}

export async function getAllIncomes(userId: number) {
    const result = await db
        .select()
        .from(incomes)
        .where(eq(incomes.userId, userId))

    return result ?? null;
}

export async function getIncomeById(userId: number, id: number) {
    const result = await db
        .select()
        .from(incomes)
        .where(and(eq(incomes.userId, userId), eq(incomes.id, id)))
        .limit(1)

    return result[0] ?? null;
}

export async function createIncome(data: { amount: number; date: Date | string; userId: number; }) {
    const actualDate = new Date(data.date);

    const [createIncome] = await db
        .insert(incomes)
        .values({
            amount: data.amount.toString(),
            date: actualDate,
            userId: data.userId
        })
        .returning({
            amount: incomes.amount,
            date: incomes.date,
            userId: incomes.userId
        });

    return createIncome;
}

export async function updateIncome(data: { id: number; amount?: number; date?: Date; }) {
    const updateData: Record<string, any> = {};
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date !== undefined) updateData.date = data.date;

    const [updated] = await db
        .update(incomes)
        .set(updateData)
        .where(eq(incomes.id, data.id))
        .returning();

    return updated;
}

export async function deleteIncomeById(id: number) {
    await db.delete(incomes).where(eq(incomes.id, id));
}
