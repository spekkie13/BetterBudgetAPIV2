import {db} from "@/lib/db/client";
import {results} from "@/lib/db/schema";
import {and, eq} from "drizzle-orm";

export async function getResultById(userId: number, id: number) {
    const result = await db
        .select()
        .from(results)
        .where(and(eq(results.id, id), eq(results.userId, userId)))
        .limit(1)

    return result[0] ?? null;
}

export async function getResultByCategoryAndPeriod(userId: number, categoryId: number, periodId: number) {
    const result = await db
        .select()
        .from(results)
        .where(and(eq(results.userId, userId), eq(results.categoryId, categoryId), eq(results.periodId, periodId)))
        .limit(1)

    return result[0] ?? null;
}

export async function getResultsByCategory(userId: number, categoryId: number) {
    const result = await db
        .select()
        .from(results)
        .where(and(eq(results.userId, userId), eq(results.categoryId, categoryId)))
        .limit(1)

    return result[0] ?? null;
}

export async function getResultsByPeriodAndCategory(userId: number, categoryId: number, periodId: number) {
    const result = await db
        .select()
        .from(results)
        .where(and(eq(results.userId, userId), eq(results.categoryId, categoryId), eq(results.periodId, periodId)))
        .limit(1)

    return result[0] ?? null;
}

export async function getResultsByPeriod(userId: number, periodId: number) {
    const result = await db
        .select()
        .from(results)
        .where(and(eq(results.userId, userId), eq(results.periodId, periodId)))

    return result ?? null;
}

export async function createResult(data: { totalSpent: number; percentageSpent: number; userId: number; categoryId: number; periodId: number; }) {
    const [createdResult] = await db
        .insert(results)
        .values({
            totalSpent: data.totalSpent.toString(),
            percentageSpent: data.percentageSpent.toString(),
            userId: data.userId,
            categoryId: data.categoryId,
            periodId: data.periodId
        })
        .returning({
            id: results.id,
            totalSpent: results.totalSpent,
            percentageSpent: results.percentageSpent,
            userId: results.userId,
            categoryId: results.categoryId,
            periodId: results.periodId
        });

    return createdResult;
}

export async function deleteResultById(id: number) {
    await db.delete(results).where(eq(results.id, id))
}

export async function updateResult(data: {
    resultId: number;
    totalSpent?: number;
    percentageSpent?: number;
    userId?: number;
    categoryId?: number;
    periodId?: number;
}) {
    const updateData: Record<string, any> = {};
    if (data.totalSpent !== undefined) updateData.totalSpent = data.totalSpent;
    if (data.percentageSpent !== undefined) updateData.percentageSpent = data.percentageSpent;
    if (data.userId !== undefined) updateData.userId = data.userId;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.periodId !== undefined) updateData.periodId = data.periodId;
    console.log(data)
    const [updated] = await db
        .update(results)
        .set(updateData)
        .where(eq(results.id, data.resultId))
        .returning();

    return updated;
}
