import {CategoryInsert, CategoryPatch, CategoryRow} from "@/db/types/categoryTypes";
import {categoryRepository} from "@/repository/categoryRepo";

export class CategoryService {
    async createCategory(data: CategoryInsert) : Promise<CategoryRow> {
        return await categoryRepository.create(data);
    }

    async updateCategory(teamId: number, id: number, data: CategoryPatch) : Promise<CategoryRow> {
        return await categoryRepository.updateById(teamId, id, data);
    }

    async deleteCategory(teamId: number, id: number): Promise<void> {
        return await categoryRepository.deleteById(teamId, id);
    }

    async categoryExists(teamId: number, id: number) : Promise<boolean> {
        return await categoryRepository.exists(teamId, id);
    }

    async getCategoryById(teamId: number, id?: number|null) : Promise<CategoryRow | CategoryRow[]> {
        if (id)
            return await categoryRepository.getById(teamId, id);
        else
            return await categoryRepository.listByTeam(teamId);
    }

    async selectAllByTeam(teamId: number): Promise<CategoryRow[]> {
        return await categoryRepository.listByTeam(teamId);
    }
}

export const categoryService = new CategoryService();
