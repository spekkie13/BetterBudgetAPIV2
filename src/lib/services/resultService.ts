import { prisma } from '@/lib/prisma';

export async function getResultById(resultId: number){
    return await prisma.result.findUnique({
        where: {
            id: resultId,
        }
    })
}

export async function getResultByCategoryAndPeriod(categoryId: number, periodId: number){
    return await prisma.result.findFirst({
        where: {
            categoryId: categoryId,
            periodId: periodId,
        }
    })
}

export async function getResultsByCategory(categoryId: number){
    return await prisma.result.findMany({
        where: {
            categoryId: categoryId,
        }
    })
}

export async function getResultsByPeriod(periodId: number){
    return await prisma.result.findMany({
        where: {
            periodId: periodId,
        }
    })
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
