import {prisma} from "@/lib/prisma";

export async function getBudgetById(id: number){
    return prisma.budget.findUnique({
        where: { id: id },
    })
}

export async function getBudgetsByCategoryId(categoryId: number){
    return await prisma.budget.findMany({
        where: { categoryId }
    })
}

export async function getBudgetsByPeriodId(periodId: number){
    return await prisma.budget.findMany({
        where: { periodId },
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
