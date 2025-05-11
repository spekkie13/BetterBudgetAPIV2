import { prisma } from '@/lib/prisma'

export function buildExpenseFilters(userId: number, categoryId?: string, monthAndYear?: string) {
    const where: any = { userId }
    console.log('month and year: ', monthAndYear)
    if (categoryId) {
        const parsedCategoryId = parseInt(categoryId)
        if (!isNaN(parsedCategoryId)) {
            where.categoryId = parsedCategoryId
        }
    }

    if (monthAndYear) {
        const decoded = decodeURIComponent(monthAndYear)
        const [monthStr, yearStr] = decoded.split('-')

        const month = parseInt(monthStr)
        const year = parseInt(yearStr)

        if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || year < 1000 || year > 9999) {
            throw new Error('Invalid monthAndYear format')
        }

        const from = new Date(year, month - 1, 1)
        const to = new Date(year, month, 1)

        where.Date = { gte: from, lt: to }
    }

    return where
}

export async function getExpensesByFilter(where: any) {
    return await prisma.expense.findMany({
        where,
        orderBy: {
            Date: 'desc'
        }
    })
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
