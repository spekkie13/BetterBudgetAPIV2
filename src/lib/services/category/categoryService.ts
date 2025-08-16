// services/categoryService.ts
import * as repo from '@/lib/db/repos/categoryRepo'
import type {CategoryInsert, CategoryRow} from "@/lib/domain/category";

// ---------- Categories ----------
export async function getCategoryByTeamAndCategoryId(categoryId: number, teamId: number) {
    return repo.selectByTeamAndId(teamId, categoryId);
}

export async function getCategoryByName(name: string, teamId: number) {
    return repo.selectByName(teamId, name);
}

export async function getAllCategories(teamId: number) {
    return repo.selectAllByTeam(teamId)
}

export async function createCategory(data: { teamId: number; name: string; color: string; icon: string; type?: 'expense' | 'income' | 'transfer'; parentId?: number | null; }) : Promise<CategoryRow> {
    const values: CategoryInsert = {
        teamId: data.teamId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        type: (data.type ?? 'expense') as any,
        parentId: data.parentId ?? null,
    }
    return repo.insert(values)
}

export async function upsertCategory(data: { teamId: number; name: string; color: string; icon: string; type?: 'expense' | 'income' | 'transfer'; parentId?: number | null; }) : Promise<CategoryRow> {
    const values: CategoryInsert = {
        teamId: data.teamId,
        name: data.name,
        color: data.color,
        icon: data.icon,
        type: (data.type ?? 'expense') as any,
        parentId: data.parentId ?? null,
    }
    return repo.upsert(values)
}

export async function deleteCategoryById(categoryId: number, teamId: number) : Promise<void> {
    await repo.deleteById(teamId, categoryId);
}
