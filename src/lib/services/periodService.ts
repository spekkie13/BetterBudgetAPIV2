import { db } from "../db/client";
import {periods} from "@/lib/db/schema";
import {desc, eq, lte} from "drizzle-orm";

export async function getPeriodById(id: number) {
    const result = await db
        .select()
        .from(periods)
        .where(eq(periods.id, id))
        .limit(1)

    return result[0] ?? null;
}

export async function getPeriodByExpenseDate(expenseDate?: Date) {
    if (!expenseDate) return null

    const result = await db
        .select()
        .from(periods)
        .where(lte(periods.startDate, expenseDate))
        .orderBy(desc(periods.endDate))
        .limit(1)

    return result[0] ?? null;
}

export async function getPeriodByStartDate(startDateInput: Date | string) {
    const startDate = new Date(startDateInput); // ensures it's a native Date object

    const result = await db
        .select({
            id: periods.id,
            startDate: periods.startDate,
            endDate: periods.endDate,
        })
        .from(periods)
        .where(eq(periods.startDate, startDate))
        .limit(1);

    return result[0] ?? null;
}

export async function createPeriod(data: { startDate: Date | string; endDate: Date | string }) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.log(start.getTime());
        console.log(end.getTime());
        throw new Error('Invalid date input');
    }

    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);

    const [createdPeriod] = await db
        .insert(periods)
        .values({
            startDate: normalizedStart,
            endDate: normalizedEnd,
        })
        .returning({
            id: periods.id,
            startDate: periods.startDate,
            endDate: periods.endDate,
        });

    return createdPeriod;
}

export async function deletePeriodById(id: number) {
    await db.delete(periods).where(eq(periods.id, id));
}

export async function updatePeriod(data: { id: number; startDate?: Date; endDate?: Date }) {
    const updateData: Record<string, any> = {};
    if (data.startDate !== undefined) updateData.startDate = data.startDate;
    if (data.endDate !== undefined) updateData.endDate = data.endDate;

    const [updated] = await db
        .update(periods)
        .set(updateData)
        .where(eq(periods.id, data.id))
        .returning();

    return updated;
}
