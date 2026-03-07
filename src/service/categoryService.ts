import {CategoryInsert, CategoryPatch, CategoryRow} from "@/db/types/categoryTypes";
import {categoryRepository} from "@/repository/categoryRepo";
import {ICategoryRepository} from "@/repository/interfaces/ICategoryRepository";

export class CategoryService {
    constructor(private readonly repo: ICategoryRepository) {}

    async createCategory(data: CategoryInsert) : Promise<CategoryRow> {
        return await this.repo.create(data);
    }

    async updateCategory(teamId: number, id: number, data: CategoryPatch) : Promise<CategoryRow> {
        return await this.repo.updateById(teamId, id, data);
    }

    async deleteCategory(teamId: number, id: number): Promise<void> {
        return await this.repo.deleteById(teamId, id);
    }

    async categoryExists(teamId: number, id: number) : Promise<boolean> {
        return await this.repo.exists(teamId, id);
    }

    async getCategoryById(teamId: number, id?: number|null) : Promise<CategoryRow | CategoryRow[]> {
        if (id)
            return await this.repo.getById(teamId, id);
        else
            return await this.repo.listByTeam(teamId);
    }

    async selectAllByTeam(teamId: number): Promise<CategoryRow[]> {
        return await this.repo.listByTeam(teamId);
    }
}

export const categoryService = new CategoryService(categoryRepository);
