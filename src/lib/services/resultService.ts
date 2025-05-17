import { prisma } from '@/lib/prisma';

/**
 * Fetch a single result by its unique ID.
 */
export async function getResultById(id: number) {
    return await prisma.result.findUnique({
        where: { id },
    });
}

/**
 * Fetch a result by categoryId and periodId.
 */
export async function getResultByCategoryAndPeriod(userId: number, categoryId: number, periodId: number) {
    return await prisma.result.findFirst({
        where: {
            userId,
            categoryId,
            periodId,
        },
    });
}

/**
 * Fetch all results for a specific category.
 */
export async function getResultsByCategory(userId: number, categoryId: number) {
    return await prisma.result.findMany({
        where: {
            userId,
            categoryId,
        },
    });
}

/**
 * Fetch all results for a specific period.
 */
export async function getResultsByPeriod(userId: number, periodId: number) {
    return await prisma.result.findMany({
        where: {
            userId,
            periodId,
        },
    });
}

/**
 * Fetch results using dynamic filters with optional relation includes.
 */
export async function findResultsByFilter(where: any) {
    return await prisma.result.findMany({
        where,
        include: {
            period: true,
            category: true,
        },
    });
}

/**
 * Create a new result record.
 */
export async function createResult(data: {
    totalSpent: number;
    percentageSpent: number;
    userId: number;
    categoryId: number;
    periodId: number;
}) {
    return await prisma.result.create({ data });
}

/**
 * Delete a result record by ID.
 */
export async function deleteResultById(id: number) {
    return await prisma.result.delete({
        where: { id },
    });
}

/**
 * Update an existing result record.
 */
export async function updateResult(data: {
    id: number;
    totalSpent?: number;
    percentageSpent?: number;
    userId?: number;
    categoryId?: number;
    periodId?: number;
}) {
    return await prisma.result.update({
        where: { id: data.id },
        data,
    });
}
