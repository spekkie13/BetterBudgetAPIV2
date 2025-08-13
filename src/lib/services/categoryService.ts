// services/categoryService.ts
import { db } from '@/lib/db/client';
import { categories, budgets as budget } from '@/lib/db/schema';
import { and, asc, eq, ilike } from 'drizzle-orm';

// --- helpers ---
const monthToDate = (yyyyMm: string) => `${yyyyMm}-01`; // "2025-08" -> "2025-08-01"
const toCents = (amount: number) => Math.round(Number(amount) * 100);

// ---------- Categories ----------

export async function getCategoryByTeamAndCategoryId(categoryId: number, teamId: number) {
    const rows = await db
        .select()
        .from(categories)
        .where(and(eq(categories.teamId, teamId), eq(categories.id, categoryId)))
        .limit(1);

    return rows[0] ?? null;
}

export async function getCategoryByTeam(teamId: number) {
    const rows = await db
        .select()
        .from(categories)
        .where(eq(categories.teamId, teamId))

    return rows ?? null;
}

export async function getCategoryByName(name: string, teamId: number) {
    const rows = await db
        .select()
        .from(categories)
        .where(and(eq(categories.teamId, teamId), ilike(categories.name, name)))
        .limit(1);

    return rows[0] ?? null;
}

export async function getAllCategories(teamId: number) {
    return db
        .select()
        .from(categories)
        .where(eq(categories.teamId, teamId))
        .orderBy(asc(categories.name));
}

export async function createCategory(data: {
    teamId: number;
    name: string;
    color: string;
    icon: string;
    type?: 'expense' | 'income' | 'transfer';
    parentId?: number | null;
}) {
    const [created] = await db
        .insert(categories)
        .values({
            teamId: data.teamId,
            name: data.name,
            color: data.color,
            icon: data.icon,
            type: (data.type ?? 'expense') as any,
            parentId: data.parentId ?? null,
        })
        .returning({
            id: categories.id,
            teamId: categories.teamId,
            name: categories.name,
            color: categories.color,
            icon: categories.icon,
            type: categories.type,
            parentId: categories.parentId,
        });

    return created;
}

export async function deleteCategoryById(categoryId: number, teamId: number) {
    await db
        .delete(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.teamId, teamId)));
}

export async function updateCategory(data: {
    id: number;
    teamId: number;
    name?: string;
    color?: string;
    icon?: string;
    type?: 'expense' | 'income' | 'transfer';
    parentId?: number | null;
}) {
    const patch: Record<string, any> = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.color !== undefined) patch.color = data.color;
    if (data.icon !== undefined) patch.icon = data.icon;
    if (data.type !== undefined) patch.type = data.type;
    if (data.parentId !== undefined) patch.parentId = data.parentId;

    const [updated] = await db
        .update(categories)
        .set(patch)
        .where(and(eq(categories.id, data.id), eq(categories.teamId, data.teamId)))
        .returning();

    return updated ?? null;
}

// ---------- Category + initial budget (no results table anymore) ----------

export async function createCategoryWithInitialBudget(data: {
    category: {
        teamId: number;
        name: string;
        color: string;
        icon: string;
        type?: 'expense' | 'income' | 'transfer';
        parentId?: number | null;
    };
    budget: {
        teamId: number;           // should match category.teamId
        categoryName?: string;    // optional helper if you don’t have id yet
        categoryId?: number;      // will be filled from the created category
        amount: number;           // major units (e.g., 125.50)
        month: string;            // "YYYY-MM"
        rollover?: boolean;
    };
}) {
    return db.transaction(async (tx) => {
        // 1) Create category
        const [newCategory] = await tx
            .insert(categories)
            .values({
                teamId: data.category.teamId,
                name: data.category.name,
                color: data.category.color,
                icon: data.category.icon,
                type: (data.category.type ?? 'expense') as any,
                parentId: data.category.parentId ?? null,
            })
            .returning({
                id: categories.id,
                teamId: categories.teamId,
                name: categories.name,
                color: categories.color,
                icon: categories.icon,
                type: categories.type,
                parentId: categories.parentId,
            });

        // 2) Upsert initial monthly budget (composite unique: team+category+month)
        const periodMonth = monthToDate(data.budget.month);
        const amountCents = toCents(data.budget.amount);

        const [newBudget] = await tx
            .insert(budget)
            .values({
                teamId: newCategory.teamId,
                categoryId: newCategory.id,
                periodMonth,
                amountCents,
                rollover: data.budget.rollover ?? false,
            })
            .onConflictDoUpdate({
                target: [budget.teamId, budget.categoryId, budget.periodMonth],
                set: {
                    amountCents,
                    rollover: data.budget.rollover ?? false,
                },
            })
            .returning();

        return { category: newCategory, budget: newBudget };
    });
}

// ---------- Budget upsert standalone (handy for UI) ----------

export async function upsertBudget(data: {
    teamId: number;
    categoryId: number;
    month: string;        // "YYYY-MM"
    amount: number;       // major units
    rollover?: boolean;
}) {
    const periodMonth = monthToDate(data.month);
    const amountCents = toCents(data.amount);

    const [row] = await db
        .insert(budget)
        .values({
            teamId: data.teamId,
            categoryId: data.categoryId,
            periodMonth,
            amountCents,
            rollover: data.rollover ?? false,
        })
        .onConflictDoUpdate({
            target: [budget.teamId, budget.categoryId, budget.periodMonth],
            set: {
                amountCents,
                rollover: data.rollover ?? false,
            },
        })
        .returning();

    return row ?? null;
}
