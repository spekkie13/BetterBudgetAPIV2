import {CategoryService} from "@/adapters/services/categoryService";
import {CategoryInsert, CategoryPatch} from "@/db/types/categoryTypes";
import {ok} from "@/core/http/Response";

export function makeCategoryController(svc: CategoryService) {
    return {
        async getCategory(teamId: number, id: number) {
            const row = await svc.selectByIdTeam(teamId, id);
            return row ? { status: 200, body: row } : { status: 404, body: { error: 'Category not found' } };
        },

        async createCategory(teamId: number, body: CategoryInsert){
            const created = await svc.insert({ ...body, teamId });
            return ok(created, 'Category created successfully', 201);
        },

        async updateCategory(teamId: number, id: number, body: CategoryPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ? { status: 200, body: updated } : { status: 404, body: { error: 'Category not found' } };
        },

        async deleteCategory(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return { status: 204, body: null, message: 'Category deleted successfully' };
        },

        async ensureAllExists(teamId: number, ids: number[]) {
            const exists = await svc.ensureAllExistForTeam(teamId,  ids)
            return { status: 200, body: exists }
        },

        async patchCategorySlots(body: unknown) {
            const result = await svc.patchCategorySlotsController(body)
            return { status: 200, body: result}
        }
    }
}
