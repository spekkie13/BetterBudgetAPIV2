import { db } from '@/db/client'
import {eq, and, ilike, inArray} from "drizzle-orm";
import { CategoryRow } from '@/app/meta/rowModel'
import {categories} from "@/db/schema/categories"
import {makeTeamScopedRepo} from "@/adapters/repo/factory/makeTeamScopedRepo";

export function makeCategoryRepo() {
    const base = makeTeamScopedRepo(db, categories, categories.id, categories.teamId)

    return {
        ...base,

        async selectByName(teamId: number, name: string): Promise<CategoryRow[]> {
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
        },

        async ensureAllExistForTeam(teamId: number, catIds: number[]) {
            if (catIds.length === 0) return;
            const rows = await db
                .select({ id: categories.id })
                .from(categories)
                .where(and(eq(categories.teamId, teamId), inArray(categories.id, catIds)));
            if (rows.length !== catIds.length) {
                throw new Error('One or more split categories are invalid for this team.');
            }
        }
    }
}
