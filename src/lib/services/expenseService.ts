import { prisma } from '@/lib/prisma'
import {Period} from "@prisma/client";

export async function getExpenseById(id: number) {
    return await prisma.expense.findUnique({
        where: {id: id}
    })
}

export async function getExpenseByCategoryId(categoryId: number) {
    return await prisma.expense.findMany({
        where: {categoryId: categoryId}
    })
}

export async function getExpenseByPeriodId(period: Period) {
    return await prisma.expense.findMany({
        where: {
            date: {
                gte: period.startDate,
                lt: period.endDate,
            },
        },
    });
}

export async function getAllExpenses(){
    return await prisma.expense.findMany();
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
