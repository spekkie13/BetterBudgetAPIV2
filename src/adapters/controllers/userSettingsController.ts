import { CategorySlotPref, UserSettingsInsert } from "@/db/types/userSettingsTypes";
import { UserSettingsService } from "@/adapters/services/userSettingsService";
import { ApiDataResponse } from "@/core/http/ApiDataResponse";

export function makeUserSettingsController(svc: UserSettingsService) {
    return {
        async getUserSetting(userId: string){
            const settings = await svc.selectById(Number(userId));
            return settings ?
                new ApiDataResponse({ status: 200, data: settings, message: 'successfully patched category slots' }) :
                new ApiDataResponse({ status: 404, data: null, message: 'Settings not found' })
        },

        async createUserSetting(body: UserSettingsInsert){
            const created = await svc.insert({ ...body });
            return created ?
                new ApiDataResponse({ data: created, status: 201, message: 'successfully created' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'Something went wrong' });
        },

        async updateUserSetting(id: number, body: UserSettingsInsert){
            const updated = await svc.updateById(id, body);
            return updated ?
                new ApiDataResponse({ data: updated, status: 201, message: 'successfully updated' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'Something went wrong' });
        },

        async deleteUserSetting(userId: number){
            await svc.deleteById(userId);
            return new ApiDataResponse({ data: null, status: 201, message: 'successfully deleted' })
        },

        async saveCategorySlots(userId: number, preferences: CategorySlotPref[]){
            const result = await svc.saveCategorySlots(userId, preferences)
            return result ?
                new ApiDataResponse({ data: result, status: 201, message: 'successfully saved category slots' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'Something went wrong' });
        }
    }
}
