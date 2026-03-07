import { CategoryInsert, CategoryPatch, CategoryRow } from '@/db/types/categoryTypes';

export interface ICategoryRepository {
    create(data: CategoryInsert): Promise<CategoryRow>;
    getById(teamId: number, id: number): Promise<CategoryRow>;
    listByTeam(teamId: number): Promise<CategoryRow[]>;
    updateById(teamId: number, id: number, data: CategoryPatch): Promise<CategoryRow>;
    deleteById(teamId: number, id: number): Promise<void>;
    exists(teamId: number, id: number): Promise<boolean>;
}
