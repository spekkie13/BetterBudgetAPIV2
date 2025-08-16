import {CategoryInsert, CategoryRow} from "@/lib/domain/category";
import { db } from '@/lib/db/client'
import {categories} from "@/lib/db/schema";
import {eq, and, ilike, inArray} from "drizzle-orm";

export async function selectAllByTeam(teamId: number): Promise<CategoryRow[]> {
    return db
        .select()
        .from(categories)
        .where(eq(categories.teamId, teamId));
}

export async function selectByTeamAndId(teamId: number, categoryId: number): Promise<CategoryRow[]>{
    return db
        .select()
        .from(categories)
        .where(
            and(
                eq(categories.teamId, teamId),
                eq(categories.id, categoryId)
            )
        )
        .limit(1);
}

export async function selectByName(teamId: number, name: string): Promise<CategoryRow[]> {
    return db
        .select()
        .from(categories)
        .where(
            and(
                eq(categories.teamId, teamId),
                ilike(categories.name, name)
            )
        )
        .limit(1);
}

export async function insert(values: CategoryInsert): Promise<CategoryRow> {
    const [created] = await db.insert(categories).values(values).returning();
    return created;
}

export async function upsert(values: CategoryInsert): Promise<CategoryRow> {
    const [row] = await db
        .insert(categories)
        .values(values)
        .onConflictDoUpdate({
            target: [categories.id],
            set: {
                teamId: values.teamId,
                name: values.name,
                color: values.color,
                icon: values.icon,
                type: (values.type ?? 'expense') as any,
                parentId: values.parentId ?? null,
            },
        })
        .returning();
    return row;
}

export async function deleteById(teamId: number, categoryId: number): Promise<void> {
    await db
        .delete(categories)
        .where(and(eq(categories.id, categoryId), eq(categories.teamId, teamId)));
}

export async function ensureAllExistForTeam(teamId: number, catIds: number[]) {
    if (catIds.length === 0) return;
    const rows = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.teamId, teamId), inArray(categories.id, catIds)));
    if (rows.length !== catIds.length) {
        throw new Error('One or more split categories are invalid for this team.');
    }
}
