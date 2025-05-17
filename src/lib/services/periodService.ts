// lib/services/periodService.ts
import { prisma } from '@/lib/prisma'
import {Period} from "@prisma/client";

export async function getPeriodById(id: number){
    return await prisma.period.findFirst({
        where: {
            id: id
        }
    })
}

export async function getPeriodByExpenseDate(expenseDate?: Date){
    return await prisma.period.findFirst({
        where: {
            startDate: { lte: expenseDate },
            endDate: { gte: expenseDate },
        },
        orderBy: {
            endDate: 'desc',
        }
    })
}

export async function getExpensesGroupedByMonthYear(userId?: number, categoryId?: number) {
    try {
        const where: any = []

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
            select: { date: true },
        })

        const seen = new Set<string>()
        const result: Period[] = []

        expenses.forEach((e) => {
            const date = new Date(e.date)
            const month = date.getMonth()
            const year = date.getFullYear()
            const startDate = new Date(Date.UTC(year, month, 1))
            const endDate = new Date(Date.UTC(year, month + 1, 1))
            const key = `${year}-${month}`

            if (!seen.has(key)) {
                seen.add(key)
                result.push({
                    id: 0, // placeholder, as we're not fetching real IDs
                    startDate,
                    endDate,
                } as Period)
            }
        })

        result.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
        return result
    } catch (error) {
        console.error('getExpensesGroupedByMonthYear error:', error)
        return []
    }
}

export async function createDate(data: any) {
    return await prisma.period.create({ data })
}

export async function deleteDateById(id: number) {
    return await prisma.period.deleteMany({ where: { id } })
}

export async function updateDate(data: any) {
    return await prisma.period.update({
        where: { id: data.id },
        data,
    })
}
