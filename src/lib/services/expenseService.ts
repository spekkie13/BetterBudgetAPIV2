import { prisma } from '@/lib/prisma'

export function buildExpenseFilters(userId: number, categoryId?: string, monthAndYear?: string) {
    const where: any = { userId }

    if (categoryId) {
        const parsedCategoryId = parseInt(categoryId)
        if (!isNaN(parsedCategoryId)) {
            where.categoryId = parsedCategoryId
        }
    }

    if (monthAndYear) {
        const [monthStr, yearStr] = decodeURIComponent(monthAndYear).split('-')
        const month = parseInt(monthStr)
        const year = parseInt(yearStr)

        if (isNaN(month) || isNaN(year)) {
            throw new Error('Invalid monthAndYear format')
        }

        const from = new Date(year, month - 1, 1)
        const to = new Date(year, month, 1)

        where.Date = { gte: from, lt: to }
    }

    return where
}

export async function getExpensesByFilter(where: any) {
    return await prisma.expense.findMany({ where })
}

export async function createExpense(data: any) {
    return await prisma.expense.create({ data })
}

export async function deleteExpenseById(id: number) {
    return await prisma.expense.deleteMany({ where: { id } })
}

export async function updateExpense(data: any) {
    return await prisma.expense.update({
        where: { id: data.id },
        data,
    })
}
