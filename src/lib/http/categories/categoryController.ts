import { CategoryQueryInput, CreateCategoryBody } from './categorySchemas';
import { HttpResult, toHttpResult } from '@/lib/http/shared/errors';
import { DeleteCategoryQuery, UpdateCategoryBody, UpdateCategoryQuery } from "@/lib/http/categories/categoryMutateSchemas";
import { CheckCategoryExistsBody } from "@/lib/http/categories/categoryExistsSchemas";
import {
    deleteByIdTeam,
    insert,
    selectAllByTeam,
    selectByIdTeam,
    updateByIdTeam,
    exists
} from "@/lib/services/category/categoryService";

export async function getCategoriesController(q: CategoryQueryInput): Promise<HttpResult> {
    try {
        const { teamId, id, name } = q;

        // /api/categories?teamId=1&id=123
        if (id !== undefined) {
            const cat = await selectByIdTeam(teamId, Number(id));
            return { status: 200, body: cat ?? {} };
        }

        // /api/categories?teamId=1&name=Groceries
        if (name) {
            let cat = await selectAllByTeam(teamId);
            cat = cat.filter(c => c.name === name);
            return { status: 200, body: cat ?? {} };
        }

        // /api/categories?teamId=1
        const all = await selectAllByTeam(teamId);
        return { status: 200, body: all };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function createCategoryController(body: unknown): Promise<HttpResult> {
    try {
        const q = CreateCategoryBody.safeParse(body);

        if (!q.success) {
            return { status: 400, body: { error: 'Invalid body' } };
        }

        const { teamId, name, color, icon, type, parentId } = q.data;

        const created = await insert({
            teamId,
            name,
            color,
            icon,
            type,                         // defaulted to 'expense' by schema if absent
            parentId: parentId ?? null,   // normalized to number|null
        });

        return { status: 201, body: created };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function updateCategoryController(query: URLSearchParams, body: unknown): Promise<HttpResult> {
    try {
        const q = UpdateCategoryQuery.safeParse(Object.fromEntries(query.entries()));
        if (!q.success) return { status: 400, body: { error: 'Must provide a valid id' } };

        const b = UpdateCategoryBody.safeParse(body);
        if (!b.success) return { status: 400, body: { error: 'Invalid body' } };

        const updated = await updateByIdTeam(b.data.teamId, q.data.id, {
            id: q.data.id,
            teamId: b.data.teamId,
            name: b.data.name ?? "",
            color: b.data.color ?? "",
            icon: b.data.icon ?? "",
            type: b.data.type,
            parentId: b.data.parentId ?? undefined, // only send if defined
        });

        // If your service returns null/undefined on not found:
        if (!updated) return { status: 404, body: { error: 'Category not found' } };

        return { status: 200, body: updated };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function deleteCategoryController(query: URLSearchParams): Promise<HttpResult> {
    try {
        const q = DeleteCategoryQuery.safeParse(Object.fromEntries(query.entries()));
        if (!q.success) return { status: 400, body: { error: 'Must provide a valid id and teamId' } };

        await deleteByIdTeam(q.data.id, q.data.teamId);

        // Prefer 204 No Content for deletes
        return { status: 204, body: null };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function checkCategoryExistsController(body: unknown): Promise<HttpResult> {
    try {
        const parsed = CheckCategoryExistsBody.safeParse(body);
        if (!parsed.success) {
            return { status: 400, body: { error: 'Invalid body' } };
        }

        const { teamId, id } = parsed.data;
        let categoryExists = await exists(teamId, id);

        return { status: 200, body: { exists: categoryExists } };
    } catch (e) {
        return toHttpResult(e);
    }
}
