import { prisma } from '@/lib/prisma'
import { Period } from '@prisma/client'

// Get a single expense by ID and user
export async function getExpenseById(userId: number, id: number) {
    return await prisma.expense.findUnique({
        where: { id },
        // Filter by userId at runtime (since `findUnique` can only filter by unique constraints)
    }).then(expense => (expense?.userId === userId ? expense : null))
}

// Get all expenses for a user
export async function getAllExpenses(userId: number) {
    return await prisma.expense.findMany({
        where: { userId },
    });
}

// Get all expenses by category and user
export async function getExpensesByCategory(userId: number, categoryId: number) {
    return await prisma.expense.findMany({
        where: {
            userId,
            categoryId,
        },
    });
}

// Get all expenses for a period range
export async function getExpensesByPeriod(userId: number, period: Period) {
    return await prisma.expense.findMany({
        where: {
            userId,
            date: {
                gte: period.startDate,
                lt: period.endDate,
            },
        },
    });
}

// Get most recent expense for a category
export async function getMostRecentExpense(userId: number, categoryId: number) {
    return await prisma.expense.findFirst({
        where: {
            userId,
            categoryId,
        },
        orderBy: {
            date: 'desc',
        },
    });
}

// Get all expenses by category to derive distinct periods (not grouped here)
export async function getExpenseDatesByCategory(userId: number, categoryId: number) {
    return await prisma.expense.findMany({
        where: {
            userId,
            categoryId,
        },
        select: {
            date: true,
        },
        orderBy: {
            date: 'desc',
        },
    });
}

// Create an expense
export async function createExpense(data: {
    description: string;
    amount: number;
    date: Date;
    userId: number;
    categoryId: number;
    isRecurring: boolean;
}) {
    return await prisma.expense.create({ data });
}

// Update an expense
export async function updateExpense(data: {
    id: number;
    description?: string;
    amount?: number;
    date?: Date;
    userId?: number;
    categoryId?: number;
}) {
    return await prisma.expense.update({
        where: { id: data.id },
        data,
    });
}

// Delete an expense by ID
export async function deleteExpenseById(id: number) {
    return await prisma.expense.delete({
        where: { id },
    });
}
