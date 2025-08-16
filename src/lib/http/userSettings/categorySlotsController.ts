import { CategorySlotsBody } from './userSettingsSchemas';
import { saveCategorySlots } from '@/lib/services/userSetting/userSettingsService';

export async function patchCategorySlotsController(body: unknown) {
    const parsed = CategorySlotsBody.safeParse(body);
    if (!parsed.success) return { status: 400, body: { error: 'Invalid input' } };

    const { userId, preferences } = parsed.data;
    await saveCategorySlots(userId, preferences);
    return { status: 201, body: {} };
}
