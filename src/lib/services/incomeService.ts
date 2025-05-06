import { prisma } from '@/lib/prisma'

export async function getAllIncomes() {
    return await prisma.income.findMany({
        include: {
            category: true,
        },
    })
}

export async function getIncomeById(id: number) {
    return await prisma.income.findUnique({
        where: { id },
        include: { category: true },
    })
}

export async function getIncomesByUserId(userId: number) {
    return await prisma.income.findMany({
        where: { userId },
        include: { category: true },
    })
}


export async function createIncome(data: any) {
    return await prisma.income.create({
        data,
        include: { category: true },
    })
}

export async function updateIncome(data: any) {
    return await prisma.income.update({
        where: { id: data.id },
        data,
        include: { category: true },
    })
}

export async function deleteIncomeById(id: number) {
    return await prisma.income.delete({
        where: { id },
    })
}
