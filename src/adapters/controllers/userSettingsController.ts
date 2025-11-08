import { CategorySlotPref, UserSettingsInsert } from "@/db/types/userSettingsTypes";
import { UserSettingsService } from "@/adapters/services/userSettingsService";
import { Response } from "@/core/http/Response";

export function makeUserSettingsController(svc: UserSettingsService) {
    return {
        async getUserSetting(userId: number){
            const settings = await svc.selectById(userId);
            return settings ?
                new Response({ status: 200, data: settings, message: 'successfully patched category slots' }) :
                new Response({ status: 404, data: null, message: 'Settings not found' })
        },

        async createUserSetting(body: UserSettingsInsert){
            const created = await svc.insert({ ...body });
            return created ?
                new Response({ data: created, status: 201, message: 'successfully created' }) :
                new Response({ data: null, status: 400, message: 'Something went wrong' });
        },

        async updateUserSetting(id: number, body: UserSettingsInsert){
            const updated = await svc.updateById(id, body);
            return updated ?
                new Response({ data: updated, status: 201, message: 'successfully updated' }) :
                new Response({ data: null, status: 400, message: 'Something went wrong' });
        },

        async deleteUserSetting(userId: number){
            await svc.deleteById(userId);
            return new Response({ data: null, status: 201, message: 'successfully deleted' })
        },

        async saveCategorySlots(userId: number, preferences: CategorySlotPref[]){
            const result = await svc.saveCategorySlots(userId, preferences)
            return result ?
                new Response({ data: result, status: 201, message: 'successfully saved category slots' }) :
                new Response({ data: null, status: 400, message: 'Something went wrong' });
        }
    }
}
