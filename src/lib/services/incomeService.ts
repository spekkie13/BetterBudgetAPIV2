import { prisma } from '@/lib/prisma';
import { Period } from '@prisma/client';

// ✅ Get incomes for a specific period
export async function getIncomesByPeriod(userId: number, period: Period) {
    return await prisma.income.findMany({
        where: {
            userId,
            date: {
                gte: period.startDate,
                lt: period.endDate,
            },
        },
    });
}

// ✅ Get all incomes for a user
export async function getAllIncomes(userId: number) {
    return await prisma.income.findMany({
        where: { userId },
    });
}

// ✅ Get a specific income by ID
export async function getIncomeById(userId: number, id: number) {
    return await prisma.income.findUnique({
        where: {
            id,
            userId,
        },
    });
}

// ✅ Create a new income
export async function createIncome(data: {
    amount: number;
    date: Date;
    userId: number;
}) {
    return await prisma.income.create({
        data,
    });
}

// ✅ Update income
export async function updateIncome(data: {
    id: number;
    amount?: number;
    date?: Date;
}) {
    return await prisma.income.update({
        where: { id: data.id },
        data,
    });
}

// ✅ Delete income
export async function deleteIncomeById(id: number) {
    return await prisma.income.delete({
        where: { id },
    });
}
