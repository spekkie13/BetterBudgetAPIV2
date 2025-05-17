import { prisma } from "@/lib/prisma";

// ✅ Get a single budget by ID and userId (using findFirst for compound filter)
export async function getBudgetById(userId: number, id: number) {
    return prisma.budget.findFirst({
        where: {
            id,
            userId,
        },
    });
}

// ✅ Get budget for a given category and period for the user
export async function getBudgetByPeriodAndCategory(userId: number, periodId: number, categoryId: number) {
    return prisma.budget.findFirst({
        where: {
            userId,
            periodId,
            categoryId,
        },
    });
}

// ✅ Get all budgets by categoryId
export async function getBudgetsByCategoryId(userId: number, categoryId: number) {
    return prisma.budget.findMany({
        where: {
            userId,
            categoryId,
        },
        orderBy: { periodId: 'asc' }, // optional: predictable sorting
    });
}

// ✅ Get all budgets by periodId
export async function getBudgetsByPeriodId(userId: number, periodId: number) {
    return prisma.budget.findMany({
        where: {
            userId,
            periodId,
        },
        orderBy: { categoryId: 'asc' },
    });
}

// ✅ Create a new budget entry (with type-safe fields)
export async function createBudget(data: {
    amount: number;
    userId: number;
    categoryId: number;
    periodId: number;
}) {
    return prisma.budget.create({
        data,
        select: { id: true, amount: true, userId: true, categoryId: true, periodId: true },
    });
}

// ✅ Delete one budget by ID (use delete if id is unique)
export async function deleteBudgetById(id: number) {
    return prisma.budget.delete({
        where: { id },
    });
}

// ✅ Update a budget by ID
export async function updateBudget(data: {
    id: number;
    amount?: number;
    userId?: number;
    categoryId?: number;
    periodId?: number;
}) {
    return prisma.budget.update({
        where: { id: data.id },
        data,
    });
}
