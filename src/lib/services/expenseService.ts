import { prisma } from '@/lib/prisma'
import {Period} from "@prisma/client";

export async function getExpenseById(userId: number, id: number) {
    return await prisma.expense.findUnique({
        where: {
            userId: userId,
            id: id
        }
    })
}

export async function getExpenseByCategoryId(userId: number, categoryId: number) {
    return await prisma.expense.findMany({
        where: {
            userId: userId,
            categoryId: categoryId
        }
    })
}

export async function getExpenseByPeriodId(userId: number, period: Period) {
    return await prisma.expense.findMany({
        where: {
            userId: userId,
            date: {
                gte: period.startDate,
                lt: period.endDate,
            },
        },
    });
}

export async function getAllExpenses(userId: number){
    return await prisma.expense.findMany({
        where: {
            userId: userId
        }
    });
}

export async function getMostRecentExpense(userId: number, categoryId: number){
    return await prisma.expense.findFirst({
        where: {
            userId,
            categoryId,
        },
        orderBy: {
            date: 'desc'
        }
    })
}

export async function getDistinctExpensePeriods(userId: number, categoryId: number){
    return await prisma.expense.findMany({
        where: {
            userId: userId,
            categoryId: categoryId
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
