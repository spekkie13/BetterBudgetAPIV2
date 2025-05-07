// lib/services/dateService.ts
import { prisma } from '@/lib/prisma'
import { DateObj } from '@/models/dateObj'

export async function getExpensesGroupedByMonthYear(userId?: number, categoryId?: number): Promise<DateObj[]> {
    try {
        const where: any = {}

        if (userId !== undefined) {
            where.userId = userId
        }

        if (categoryId !== undefined) {
            const category = await prisma.category.findFirst({
                where: { id: categoryId },
            })
            if (!category) return []

            where.categoryId = category.id
        }

        const expenses = await prisma.expense.findMany({
            where,
            select: { Date: true },
        })

        const seen = new Set<string>()
        const result: DateObj[] = []

        expenses.forEach((e, index) => {
            const date = new Date(e.Date)
            const month = date.getMonth() + 1
            const year = date.getFullYear()
            const day = date.getDate()
            const key = `${month}-${year}`

            if (!seen.has(key)) {
                seen.add(key)
                result.push(new DateObj({ day, month, year, id: index }))
            }
        })

        result.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))

        return result
    } catch (error) {
        console.error('getExpensesGroupedByMonthYear error:', error)
        return []
    }
}

export async function createDate(data: any) {
    return await prisma.dateObj.create({ data })
}

export async function deleteDateById(id: number) {
    return await prisma.dateObj.deleteMany({ where: { id } })
}

export async function updateDate(data: any) {
    return await prisma.dateObj.update({
        where: { id: data.id },
        data,
    })
}
