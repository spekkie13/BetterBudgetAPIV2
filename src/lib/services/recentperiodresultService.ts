import { prisma } from '@/lib/prisma';

// Build filter object to be used with Prisma queries
export function buildPeriodFilters(userId: number, categoryId?: number, from?: Date, to?: Date) {
    const where: any = {
        userId,
    };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    // Filter via the related Period
    if (from && to) {
        where.period = {
            startDate: { gte: from },
            endDate: { lt: to },
        };
    }

    return where;
}

// Fetch multiple RecentPeriodResults by filters
export async function findPeriodResultsByFilter(where: any) {
    return await prisma.result.findMany({
        where,
        include: {
            period: true,
            category: true,
        },
    });
}

// Create a new RecentPeriodResult
export async function createNewPeriodResult(data: {
    totalSpent: number;
    percentageSpent: number;
    userId: number;
    categoryId: number;
    periodId: number;
}) {
    return await prisma.result.create({ data });
}

// Delete RecentPeriodResult by ID
export async function deletePeriodResults(id: number) {
    return await prisma.result.delete({
        where: { id },
    });
}

// Update an existing RecentPeriodResult
export async function updatePeriodResult(data: {
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
