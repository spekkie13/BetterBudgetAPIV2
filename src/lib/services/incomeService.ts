import { prisma } from '@/lib/prisma'
import {Period} from "@prisma/client";

export async function getIncomesByPeriod(period: Period){
    await prisma.income.findMany({
        where: {
            date: {
                gte: period.startDate,
                lt: period.endDate,
            },
        },
    });
}

export async function getAllIncomes() {
    return await prisma.income.findMany()
}

export async function getIncomeById(id: number) {
    return await prisma.income.findUnique({
        where: { id },
    })
}

export async function getIncomesByUserId(userId: number) {
    return await prisma.income.findMany({
        where: { userId },
    })
}

export async function createIncome(data: any) {
    return await prisma.income.create({
        data,
    })
}

export async function updateIncome(data: any) {
    return await prisma.income.update({
        where: { id: data.id },
        data,
    })
}

export async function deleteIncomeById(id: number) {
    return await prisma.income.delete({
        where: { id },
    })
}
