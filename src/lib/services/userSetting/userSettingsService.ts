// services/userSettingsService.ts
import { db } from '@/db/client';
import { userSettings } from '@/db/schema';
import { eq, InferInsertModel, InferSelectModel } from 'drizzle-orm';

// ---------- Types ----------
export type UserSettingsRow = InferSelectModel<typeof userSettings>;
export type InsertUserSettings = InferInsertModel<typeof userSettings>;
export type Prefs = Record<string, unknown>;
type CategorySlotPref = { name: string; numberValue: number | null };

// ---------- Select helpers ----------
const selectShape = {
    userId: userSettings.userId,
    theme: userSettings.theme,
    textSize: userSettings.textSize,
    preferences: userSettings.preferences,
};

// Small helpers to avoid repeating onConflictDoUpdate boilerplate
async function upsertSet(values: InsertUserSettings) {
    const [row] = await db
        .insert(userSettings)
        .values(values)
        .onConflictDoUpdate({
            target: userSettings.userId,
            set: values,
        })
        .returning(selectShape);
    return row;
}

async function upsertMerge(userId: number, partial: Partial<Omit<InsertUserSettings, 'userId'>>) {
    const [row] = await db
        .insert(userSettings)
        .values({ userId, ...partial })
        .onConflictDoUpdate({
            target: userSettings.userId,
            set: partial,
        })
        .returning(selectShape);
    return row;
}

// ---------- Reads ----------
export async function getUserSettingsByUserId(userId: number): Promise<UserSettingsRow | null> {
    const rows = await db
        .select(selectShape)
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);
    return rows[0] ?? null;
}

// Read a single key from preferences JSON
export async function getPreference<T = unknown>(userId: number, name: string): Promise<T | null> {
    const settings = await getUserSettingsByUserId(userId);
    if (!settings?.preferences || typeof settings.preferences !== 'object') return null;
    return (settings.preferences as Prefs)[name] as T ?? null;
}

// ---------- Writes / Upserts ----------

// Full upsert (replace provided fields)
export async function upsertUserSettings(data: {
    userId: number;
    theme?: string | null;
    textSize?: string | null;
    preferences?: Prefs | null;
}) {
    const values: InsertUserSettings = {
        userId: data.userId,
        ...(data.theme !== undefined ? { theme: data.theme } : {}),
        ...(data.textSize !== undefined ? { textSize: data.textSize } : {}),
        ...(data.preferences !== undefined ? { preferences: data.preferences } : {}),
    };
    return upsertSet(values);
}

// Patch (update only provided columns; convenient wrapper)
export async function patchUserSettings(
    userId: number,
    patch: { theme?: string | null; textSize?: string | null; preferences?: Prefs | null }
) {
    const values: Partial<InsertUserSettings> = {};
    if (patch.theme !== undefined) values.theme = patch.theme;
    if (patch.textSize !== undefined) values.textSize = patch.textSize;
    if (patch.preferences !== undefined) values.preferences = patch.preferences;
    return upsertMerge(userId, values);
}

// Convenience setters
export async function setTheme(userId: number, theme: string | null) {
    return upsertMerge(userId, { theme });
}

export async function setTextSize(userId: number, textSize: string | null) {
    return upsertMerge(userId, { textSize });
}

// Merge a partial object into preferences (shallow merge)
export async function setPreferences(userId: number, partial: Prefs) {
    const current = await getUserSettingsByUserId(userId);
    const merged: Prefs = { ...(current?.preferences as Prefs ?? {}), ...partial };
    return upsertMerge(userId, { preferences: merged });
}

// Set a single preference key
export async function setPreference(userId: number, name: string, value: unknown) {
    const current = await getUserSettingsByUserId(userId);
    const prefs: Prefs = { ...(current?.preferences as Prefs ?? {}) };
    prefs[name] = value;
    return upsertMerge(userId, { preferences: prefs });
}

// Delete a single preference key
export async function deletePreference(userId: number, name: string) {
    const current = await getUserSettingsByUserId(userId);
    const prefs: Prefs = { ...(current?.preferences as Prefs ?? {}) };
    if (name in prefs) delete prefs[name];
    return upsertMerge(userId, { preferences: prefs });
}

// Save category slot layout inside preferences.categorySlots
export async function saveCategorySlots(userId: number, preferences: CategorySlotPref[]) {
    const current = await getUserSettingsByUserId(userId);
    const existingSlots: Record<string, number | null> =
        ((current?.preferences as Prefs)?.categorySlots as Record<string, number | null>) ?? {};

    const categorySlots: Record<string, number | null> = { ...existingSlots };
    for (const p of preferences) {
        categorySlots[p.name] = p.numberValue ?? null;
    }

    const newPrefs: Prefs = { ...(current?.preferences as Prefs ?? {}), categorySlots };
    return upsertMerge(userId, { preferences: newPrefs });
}

// Optional hard delete (you can prefer resetting preferences instead)
export async function deleteUserSettingsByUserId(userId: number) {
    await db.delete(userSettings).where(eq(userSettings.userId, userId));
}
