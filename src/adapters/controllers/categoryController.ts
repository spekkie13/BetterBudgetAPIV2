import {CategoryService} from "@/adapters/services/categoryService";
import {CategoryInsert, CategoryPatch} from "@/db/types/categoryTypes";
import {ApiDataResponse} from "@/core/http/ApiDataResponse";

export function makeCategoryController(svc: CategoryService) {
    return {
        async getCategory(teamId: number, categoryId?: number | null) {
            if (categoryId === undefined || categoryId === null) {
                const row = await svc.selectAllByTeam(teamId);
                return row ?
                    new ApiDataResponse({ data: row, status: 200, message: 'success'}) :
                    new ApiDataResponse({ data: null, status: 404, message: 'No categories found'})
            }
            const row = await svc.selectByIdTeam(teamId, categoryId);
            return row ?
                new ApiDataResponse({ data: row, status: 200, message: 'success'}) :
                new ApiDataResponse({ data: null, status: 404, message: 'No categories found'})
        },

        async createCategory(teamId: number, body: CategoryInsert){
            const created = await svc.insert({ ...body, teamId });
            return created ?
                new ApiDataResponse({ data: created, status: 200, message: 'successfully created' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'No category created' });
        },

        async updateCategory(teamId: number, id: number, body: CategoryPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ?
                new ApiDataResponse({ data: updated, status: 200, message: 'successfully created' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'No category created' });
        },

        async deleteCategory(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return new ApiDataResponse({ data: null, status: 201, message: 'successfully deleted category' });
        },

        async ensureAllExists(teamId: number, ids: number[]) {
            const exists = await svc.ensureAllExistForTeam(teamId, ids)
            return exists ?
                new ApiDataResponse({ data: exists, status: 200, message: 'all ids exist'}) :
                new ApiDataResponse({ data: null, status: 404, message: 'not all ids exist' });
        },

        async patchCategorySlots(body: unknown) {
            const result = await svc.patchCategorySlotsController(body)
            return result ?
                new ApiDataResponse({ data: result, status: 201, message: 'successfully patched category slots' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'Something went wrong' });
        }
    }
}
