import { makeCategoryRepo } from "@/adapters/repo/categoryRepo";
import {TeamScopedServiceBase} from "@/adapters/services/factory/teamScopedServiceBase";
import {CategoryInsert, CategoryPatch, CategoryRow, CategorySlotsBody} from "@/db/types/categoryTypes";
import {db} from "@/db/client";
import {categories} from "@/db/schema";
import {and, eq, ilike, inArray} from "drizzle-orm";
import {UserSettingsService} from "@/adapters/services/userSettingsService";
import {makeUserSettingsController} from "@/adapters/controllers/userSettingsController";

const service = new UserSettingsService();
const controller = makeUserSettingsController(service);

export class CategoryService extends TeamScopedServiceBase<CategoryRow, number, number, CategoryInsert, CategoryPatch>{
    constructor() {
        super(makeCategoryRepo())
    }

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
    }

    async ensureAllExistForTeam(teamId: number, catIds: number[]) {
        if (catIds.length === 0) return false;
        const rows = await db
            .select({ id: categories.id })
            .from(categories)
            .where(and(eq(categories.teamId, teamId), inArray(categories.id, catIds)));
        return rows.length === catIds.length;
    }

    async patchCategorySlotsController(body: unknown) {
        const parsed = CategorySlotsBody.safeParse(body);
        if (!parsed.success) return { status: 400, body: { error: 'Invalid input' } };

        const { userId, preferences } = parsed.data;
        await controller.saveCategorySlots(userId, preferences);
        return { status: 201, body: {} };
    }
}
