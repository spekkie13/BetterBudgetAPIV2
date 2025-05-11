import {prisma} from "@/lib/prisma";

export function buildPeriodFilters(userId: number, categoryId?: number, from?: Date, to?: Date) {
    const where: any = { userId };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (from && to) {
        where.Date = {
            gte: from,
            lt: to,
        };
    }

    return where;
}

export async function findPeriodResultsByFilter(where: any){
    return await prisma.recentPeriodResult.findMany({ where })
}

export async function createNewPeriodResult(recentperiodresult: any){
    return await prisma.recentPeriodResult.create({data: recentperiodresult})
}

export async function deletePeriodResults(RecentPeriodResultId: number) {
    return await prisma.category.deleteMany({ where: { id: RecentPeriodResultId } })
}

export async function updatePeriodResult(data: any){
    return await prisma.recentPeriodResult.update({
        where: { id: data.id },
        data,
    })
}
