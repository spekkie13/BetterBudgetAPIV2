import { prisma } from '@/lib/prisma'
import { Period } from '@prisma/client'

export async function getPeriodById(id: number): Promise<Period | null> {
    return prisma.period.findUnique({
        where: { id },
    })
}

export async function getPeriodByExpenseDate(expenseDate?: Date): Promise<Period | null> {
    if (!expenseDate) return null

    return prisma.period.findFirst({
        where: {
            startDate: { lte: expenseDate },
            endDate: { gte: expenseDate },
        },
        orderBy: {
            endDate: 'desc',
        },
    })
}

export async function getExpensesGroupedByMonthYear(
    userId?: number,
    categoryId?: number
): Promise<Period[]> {
    try {
        const where: any = {}

        if (userId !== undefined) {
            where.userId = userId
        }

        if (categoryId !== undefined) {
            where.categoryId = categoryId
        }

        const expenses = await prisma.expense.findMany({
            where,
            select: { date: true },
        })

        const seen = new Set<string>()
        const result: Period[] = []

        for (const e of expenses) {
            const date = new Date(e.date)
            const month = date.getMonth()
            const year = date.getFullYear()
            const startDate = new Date(Date.UTC(year, month, 1))
            const endDate = new Date(Date.UTC(year, month + 1, 1))
            const key = `${year}-${month}`

            if (!seen.has(key)) {
                seen.add(key)
                result.push({
                    id: 0, // Placeholder, not actual DB ID
                    startDate,
                    endDate,
                } as Period)
            }
        }

        result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        return result
    } catch (error) {
        console.error('getExpensesGroupedByMonthYear error:', error)
        return []
    }
}

export async function createPeriod(data: { startDate: Date; endDate: Date }): Promise<Period> {
    return prisma.period.create({ data })
}

export async function deletePeriodById(id: number): Promise<void> {
    await prisma.period.delete({ where: { id } })
}

export async function updatePeriod(data: { id: number; startDate?: Date; endDate?: Date }): Promise<Period> {
    return prisma.period.update({
        where: { id: data.id },
        data,
    })
}
