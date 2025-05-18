import { prisma } from '@/lib/prisma'
import { Period } from '@prisma/client'

export async function getPeriodById(id: number): Promise<Period | null> {
    return prisma.period.findUnique({
        where: { id },
    })
}

export async function getPeriodByDate(expenseDate?: Date): Promise<Period | null> {
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
