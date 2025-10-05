import {CategorySlotPref, UserSettingsInsert, UserSettingsParams} from "@/db/types/userSettingsTypes";
import {UserSettingsService} from "@/adapters/services/userSettingsService";
import {ok} from "@/core/http/Response";

export function makeUserSettingsController(svc: UserSettingsService) {
    return {
        async getUserSetting(userId: string){
            const settings = await svc.selectById(Number(userId));
            return settings
                ? { status: 200, body: settings }
                : { status: 404, body: { error: 'Settings not found' } };
        },

        async createUserSetting(body: UserSettingsInsert){
            const created = await svc.insert({ ...body });
            return ok(created, 'budget created successfully',201);
        },

        async updateUserSetting(id: number, body: UserSettingsInsert){
            const updated = await svc.updateById(id, body);
            return updated ? ok(updated) : { status: 404, body: { error: 'budget not found' } };
        },

        async deleteUserSetting(userId: string){
            const parsed = UserSettingsParams.safeParse({ userId: userId.toString()});
            if (!parsed.success) return { status: 400, body: { error: 'Invalid userId' } };

            await svc.deleteById(parsed.data.userId);
            return { status: 200, body: { message: 'Deleted' } };
        },

        async saveCategorySlots(userId: number, preferences: CategorySlotPref[]){
            await svc.saveCategorySlots(userId, preferences)
        }
    }
}
