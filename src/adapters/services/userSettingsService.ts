import { CategorySlotPref, UserSettingsInsert, UserSettingsPatch, UserSettingsRow } from "@/db/types/userSettingsTypes";
import {makeUserSettingsRepo} from "@/adapters/repo/userSettingsRepo";
import {KeyedRepoServiceBase} from "@/adapters/services/factory/keyedRepoServiceBase";
import {db} from "@/db/client";
import {userSettings} from "@/db/schema";

export class UserSettingsService extends KeyedRepoServiceBase<UserSettingsRow, number, UserSettingsInsert, UserSettingsPatch> {
    constructor(){
        super(makeUserSettingsRepo())
    }

    async upsertMerge(userId: number, partial: Partial<Omit<UserSettingsInsert, 'userId'>>) {
        const [row] = await db
            .insert(userSettings)
            .values({ userId, ...partial })
            .onConflictDoUpdate({
                target: userSettings.userId,
                set: partial,
            })
            .returning();
        return row;
    }

    // Save category slot layout inside preferences.categorySlots
    async saveCategorySlots(userId: number, preferences: CategorySlotPref[]) {
        const current = await super.repo.getById(userId);
        const existingSlots: Record<string, number | null> =
            ((current?.preferences as Record<string, unknown>)?.categorySlots as Record<string, number | null>) ?? {};

        const categorySlots: Record<string, number | null> = { ...existingSlots };
        for (const p of preferences) {
            categorySlots[p.name] = p.numberValue ?? null;
        }

        const newPrefs: Record<string, unknown> = { ...(current?.preferences as Record<string, unknown> ?? {}), categorySlots };
        return this.upsertMerge(userId, { preferences: newPrefs });
    }
}
