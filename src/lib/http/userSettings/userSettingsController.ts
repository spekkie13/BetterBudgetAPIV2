import {
    GetSettingsQuery,
    UpsertSettingsBody,
    SetPreferenceBody,
    PatchSettingsBody,
    DeleteSettingsQuery,
} from './userSettingsSchemas';
import {
    getUserSettingsByUserId,
    getPreference,
    setPreference,
    upsertUserSettings,
    patchUserSettings,
    deleteUserSettingsByUserId,
} from '@/lib/services/userSetting/userSettingsService';

export async function getUserSettingsController(params: URLSearchParams) {
    const parsed = GetSettingsQuery.safeParse(Object.fromEntries(params.entries()));
    if (!parsed.success) return { status: 400, body: { error: 'Invalid query params' } };

    const { userId, preferenceName } = parsed.data;

    if (preferenceName) {
        const value = await getPreference(userId, preferenceName);
        return value !== null
            ? { status: 200, body: { name: preferenceName, value } }
            : { status: 404, body: { error: 'Preference not found' } };
    }

    const settings = await getUserSettingsByUserId(userId);
    return settings
        ? { status: 200, body: settings }
        : { status: 404, body: { error: 'Settings not found' } };
}

export async function postUserSettingsController(body: unknown) {
    // Branch A: set single preference
    const single = SetPreferenceBody.safeParse(body);
    if (single.success) {
        const { userId, name, value } = single.data;
        const updated = await setPreference(userId, name, value);
        return { status: 201, body: updated };
    }

    // Branch B: upsert whole/partial settings
    const upsert = UpsertSettingsBody.safeParse(body);
    if (!upsert.success) return { status: 400, body: { error: 'Invalid input' } };

    const updated = await upsertUserSettings({
        userId: upsert.data.userId,
        theme: upsert.data.theme ?? undefined,
        textSize: upsert.data.textSize ?? undefined,
        preferences: upsert.data.preferences ?? undefined,
    });

    return { status: 201, body: updated };
}

export async function putUserSettingsController(body: unknown) {
    const parsed = UpsertSettingsBody.safeParse(body);
    if (!parsed.success) return { status: 400, body: { error: 'Missing or invalid userId' } };

    const updated = await upsertUserSettings({
        userId: parsed.data.userId,
        theme: parsed.data.theme ?? undefined,
        textSize: parsed.data.textSize ?? undefined,
        preferences: parsed.data.preferences ?? undefined,
    });

    return { status: 200, body: updated };
}

export async function patchUserSettingsController(body: unknown) {
    const parsed = PatchSettingsBody.safeParse(body);
    if (!parsed.success) return { status: 400, body: { error: 'Missing or invalid userId or no fields to patch' } };

    const patched = await patchUserSettings(parsed.data.userId, {
        theme: parsed.data.theme,
        textSize: parsed.data.textSize,
        preferences: parsed.data.preferences,
    });

    return { status: 200, body: patched };
}

export async function deleteUserSettingsController(params: URLSearchParams) {
    const parsed = DeleteSettingsQuery.safeParse(Object.fromEntries(params.entries()));
    if (!parsed.success) return { status: 400, body: { error: 'Invalid userId' } };

    await deleteUserSettingsByUserId(parsed.data.userId);
    return { status: 200, body: { message: 'Deleted' } };
}
