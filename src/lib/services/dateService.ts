// lib/services/dateService.ts
import { prisma } from '@/lib/prisma'
import {DateObj} from "@/models/dateObj";

export async function getExpensesGroupedByMonthYear(categoryName?: string) {
    let expenses: any[] = []

    if (categoryName) {
        const category = await prisma.category.findFirst({
            where: { Name: categoryName },
        })
        if (!category) return { error: 'Category not found', expenses: null }

        expenses = await prisma.expense.findMany({
            where: { categoryId: category.id },
            select: { Date: true },
        })
    } else {
        expenses = await prisma.expense.findMany({
            select: { Date: true },
        })
    }

    const seen = new Set<string>()
    const result: DateObj[] = []

    expenses.forEach((e: any, index: number) => {
        const date = new Date(e.Date.year, e.Date.month - 1, e.Date.day)
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        const day = date.getDate()
        const key = `${month}-${year}`

        if (!seen.has(key)) {
            seen.add(key)
            result.push({ day, month, year, id: index })
        }
    })

    result.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))

    return { result }
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
