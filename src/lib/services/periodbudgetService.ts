import {prisma} from "@/lib/prisma";

export async function getBudgetById(userId: number, id: number){
    return prisma.budget.findUnique({
        where: {
            id: id,
            userId: userId,
        },
    })
}

export async function getBudgetByPeriodAndCategory(userId: number, periodId: number, categoryId: number){
    return await prisma.budget.findFirst({
        where: {
            userId: userId,
            periodId: periodId,
            categoryId: categoryId,
        }
    })
}

export async function getBudgetsByCategoryId(userId: number, categoryId: number){
    return await prisma.budget.findMany({
        where: {
            categoryId: categoryId,
            userId: userId,
        }
    })
}

export async function getBudgetsByPeriodId(userId: number, periodId: number){
    return await prisma.budget.findMany({
        where: {
            periodId: periodId,
            userId: userId,
        },
    })
}

export async function createBudget(budget: any){
    return await prisma.budget.create({data: budget})
}

export async function deleteManyBudgets(id: number){
    return await prisma.budget.deleteMany({ where: { id: id } })
}

export async function updateBudget(data: any){
    return await prisma.budget.update({
        where: { id: data.id },
        data,
    })
}
