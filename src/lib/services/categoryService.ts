import { prisma } from '@/lib/prisma'

// 🟢 1. Use `findFirst` with compound `where` for `getCategoryById`
export async function getCategoryById(categoryId: number, userId: number) {
    return prisma.category.findFirst({
        where: {
            id: categoryId,
            userId,
        },
    })
}

// 🟢 2. Case-insensitive match support
export async function getCategoryByName(name: string, userId: number) {
    return prisma.category.findFirst({
        where: {
            userId,
            name: {
                equals: name,
                mode: 'insensitive',
            },
        },
    })
}

export async function getAllCategories(userId: number) {
    return prisma.category.findMany({
        where: { userId },
        orderBy: { id: 'asc' }, // ✅ Optional: consistent ordering
    })
}

// 🟢 3. Add `select` to limit returned fields (optional)
export async function createCategory(data: { name: string, color: string, icon: string, userId: number }) {
    return prisma.category.create({
        data,
        select: { id: true, name: true, color: true, icon: true, userId: true },
    })
}

// 🟢 4. Use `delete` with unique ID instead of `deleteMany`
export async function deleteCategoryById(categoryId: number) {
    return prisma.category.delete({
        where: { id: categoryId },
    })
}

export async function updateCategory(data: { id: number, name?: string, color?: string, icon?: string, userId?: number }) {
    return prisma.category.update({
        where: { id: data.id },
        data,
    })
}

export async function createCategoryWithInitialBudget(data: {
    category: {
        name: string
        color: string
        icon: string
        userId: number
    }
    budget: {
        amount: number
        periodId: number
        userId: number
    }
}) {
    return prisma.$transaction(async (tx) => {
        const newCategory = await tx.category.create({
            data: data.category,
            select: { id: true, name: true, color: true, icon: true, userId: true },
        });

        const newBudget = await tx.budget.create({
            data: {
                amount: data.budget.amount,
                periodId: data.budget.periodId,
                userId: data.budget.userId,
                categoryId: newCategory.id,
            },
        });

        return {
            category: newCategory,
            budget: newBudget,
        };
    });
}
