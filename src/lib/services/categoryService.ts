import {db} from "@/lib/db/client";
import {budgets, categories, results} from "@/lib/db/schema";
import {and, asc, eq, ilike} from "drizzle-orm";

export async function getCategoryById(categoryId: number, userId: number) {
    const result = await db
        .select()
        .from(categories)
        .where(and(eq(categories.userId, userId), eq(categories.id, categoryId)))
        .limit(1);

    return result[0] ?? null;
}

export async function getCategoryByName(name: string, userId: number) {
    const result = await db
        .select()
        .from(categories)
        .where(
            and(eq(categories.userId, userId),
            ilike(categories.name, name))
        )
        .limit(1);

    return result[0] ?? null;
}

export async function getAllCategories(userId: number) {
    const result = await db
        .select()
        .from(categories)
        .where(eq(categories.userId, userId))
        .orderBy(asc(categories.id))

    return result ?? null;
}

export async function createCategory(data: { name: string, color: string, icon: string, userId: number }) {
    const [createdCategory] = await db
        .insert(categories)
        .values({
            name: data.name,
            color: data.color,
            icon: data.icon,
            userId: data.userId,
        })
        .returning({
            id: categories.id,
            name: categories.name,
            color: categories.color,
            icon: categories.icon,
            userId: categories.userId,
        });

    return createdCategory;
}

export async function deleteCategoryById(categoryId: number) {
    await db.delete(categories).where(eq(categories.id, categoryId));
}

export async function updateCategory(data: { id: number, name?: string, color?: string, icon?: string, userId?: number }) {
    // Build update object dynamically and convert amount to string if needed
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.icon !== undefined) updateData.periodId = data.icon;
    if (data.userId !== undefined) updateData.userId = data.userId;

    const [updated] = await db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, data.id))
        .returning();

    return updated;
}

export async function createCategoryWithInitialBudget(data: {
    category: {
        name: string;
        color: string;
        icon: string;
        userId: number;
    };
    budget: {
        amount: number;
        periodId: number;
        userId: number;
    };
    result: {
        totalSpent: number;
        percentageSpent: number;
        userId: number;
        periodId: number;
    }
}) {
    return await db.transaction(async (tx) => {
        const [newCategory] = await tx
            .insert(categories)
            .values(data.category)
            .returning({
                id: categories.id,
                name: categories.name,
                color: categories.color,
                icon: categories.icon,
                userId: categories.userId,
            });

        const [newBudget] = await tx
            .insert(budgets)
            .values({
                amount: data.budget.amount.toString(), // 🔸 Drizzle stores Decimal as string
                periodId: data.budget.periodId,
                userId: data.budget.userId,
                categoryId: newCategory.id,
            })
            .returning();

        const [newResult] = await tx
            .insert(results)
            .values({
                totalSpent: data.result.totalSpent.toString(),
                percentageSpent: data.result.percentageSpent.toString(),
                userId: data.result.userId,
                categoryId: newCategory.id,
                periodId: data.result.periodId,
            })
            .returning()

        return {
            category: newCategory,
            budget: newBudget,
            result: newResult,
        };
    });
}
