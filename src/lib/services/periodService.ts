import { db } from "../db/client";
import {periods} from "@/lib/db/schema";
import {desc, eq, lte} from "drizzle-orm";
import {Period} from "@/models/period";

export async function getPeriodById(id: number) {
    const result = await db
        .select()
        .from(periods)
        .where(eq(periods.id, id))
        .limit(1)

    return result[0] ?? null;
}

export async function getPeriodByDate(date?: Date) {
    if (!date) return null

    const result = await db
        .select()
        .from(periods)
        .where(lte(periods.startDate, date))
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

export async function createPeriod(data: { startDate: Date | string; endDate: Date | string; startingAmount: number}) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);

    const startingAmountString = data.startingAmount.toString()
    const [createdPeriod] = await db
        .insert(periods)
        .values({
            startDate: normalizedStart,
            endDate: normalizedEnd,
            startingAmount: startingAmountString,
        })
        .returning({
            id: periods.id,
            startDate: periods.startDate,
            endDate: periods.endDate,
            startingAmount: periods.startingAmount,
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

export function calculatePeriodRange(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() // 0-11
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    return { startDate, endDate }
}

export async function createPeriodIfNotExists(parsedDate: Date, startingAmount: number){
    let period = await getPeriodByDate(parsedDate)

    if (!period) {
        const { startDate, endDate } = calculatePeriodRange(parsedDate)
        period = await createPeriod({startDate, endDate, startingAmount})
    }

    const periodData = {
        ...period,
        startingAmount: Number(startingAmount),
    }
    return new Period(periodData);
}
