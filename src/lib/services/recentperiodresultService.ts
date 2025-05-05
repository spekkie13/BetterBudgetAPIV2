import {prisma} from "@/lib/prisma";

export async function buildPeriodFilters(userId: number, categoryId: number){
    const where : any = {}
    where.userId = userId;
    where.id = categoryId

    return where
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
