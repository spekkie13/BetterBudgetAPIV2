import {db} from "@/db/client";
import {categories} from "@/db/schema";
import {and, eq} from "drizzle-orm";
import {CategoryInsert, CategoryPatch, CategoryRow} from "@/db/types/categoryTypes";
import {ICategoryRepository} from "@/repository/interfaces/ICategoryRepository";

export class CategoryRepository implements ICategoryRepository {
    async create(data: CategoryInsert) : Promise<CategoryRow> {
        const [row] = await db
            .insert(categories)
            .values(data)
            .returning()

        return row;
    }

    async getById(teamId: number, id: number) : Promise<CategoryRow> {
        const [row] = await db
            .select()
            .from(categories)
            .where(
                and(
                    eq(categories.teamId, teamId),
                    eq(categories.id, id)
                )
            )
            .limit(1)

        return row;
    }

    async listByTeam(teamId: number) : Promise<CategoryRow[]> {
        return await db
            .select()
            .from(categories)
            .where(eq(categories.teamId, teamId));
    }

    async updateById(teamId: number, id: number, data: CategoryPatch) : Promise<CategoryRow> {
        const [row] = await db
            .update(categories)
            .set(data)
            .where(
                and(
                    eq(categories.teamId, teamId),
                    eq(categories.id, id)
                )
            )
            .returning()

        return row;
    }

    async deleteById(teamId: number, id: number) : Promise<void> {
        await db
            .delete(categories)
            .where(
                and(
                    eq(categories.teamId, teamId),
                    eq(categories.id, id)
                )
            );
    }

    async exists(teamId: number, id: number): Promise<boolean> {
        const [row] = await db
            .select()
            .from(categories)
            .where(
                and(
                    eq(categories.teamId, teamId),
                    eq(categories.id, id)
                )
            )
            .limit(1);

        if (!row)
            return false;

        return true;
    }
}

export const categoryRepository = new CategoryRepository()
