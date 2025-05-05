import {prisma} from "@/lib/prisma";

export async function buildBudgetFilters(userId: number, categoryIdParam: string, monthAndYearParam: string) {
    let where : any = { userId };
    if(monthAndYearParam) {
        const [monthStr, yearStr] = decodeURIComponent(monthAndYearParam).split('-')
        const month = parseInt(monthStr)
        const year = parseInt(yearStr)

        if (isNaN(month) || isNaN(year)){
            return "invalid"
        }

        where.month = month
        where.year = year
    }

    if (categoryIdParam) {
        const categoryId = parseInt(categoryIdParam)
        if (!isNaN(categoryId)) {
            where.categoryId = categoryId
        }
    }

    return where
}

export async function getBudgetByFilter(where: any){
    return await prisma.periodBudget.findMany({ where })
}

export async function createBudget(budget: any){
    return await prisma.periodBudget.create({data: budget})
}

export async function deleteManyBudgets(id: number){
    return await prisma.periodBudget.deleteMany({ where: { id: id } })
}

export async function updateBudget(data: any){
    return await prisma.periodBudget.update({
        where: { id: data.id },
        data,
    })
}
