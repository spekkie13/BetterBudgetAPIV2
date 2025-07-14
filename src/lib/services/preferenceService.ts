import {db} from "@/lib/db/client";
import {userPreferences} from "@/lib/db/schema";
import {and, eq, ilike} from "drizzle-orm";

export async function getUserPreferencesByUserId(userId: number) {
    const result = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId))
        .orderBy(userPreferences.id)

    return result ?? null;
}

export async function getUserPreferenceById(id: number) {
    const result = await db
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.id, id))

    return result ?? null;
}

export async function getUserPreferenceByName(name: string, userId: number) {
    const result = await db
        .select()
        .from(userPreferences)
        .where(and(ilike(userPreferences.name, name), eq(userPreferences.userId, userId)))
        .limit(1)

    return result[0] ?? null;
}

export async function createUserPreference(data: { id: number; userId: number; name: string; stringValue: string; numberValue: number; dateValue: Date }) {
    const [createdPreference] = await db
        .insert(userPreferences)
        .values({
            userId: data.userId,
            name: data.name,
            stringValue: data.stringValue,
            numberValue: data.numberValue,
            dateValue: data.dateValue,
        })
        .returning({
            id: userPreferences.id,
            userId: userPreferences.userId,
            name: userPreferences.name,
            stringValue: userPreferences.stringValue,
            numberValue: userPreferences.numberValue,
            dateValue: userPreferences.dateValue
        });

    return createdPreference;
}

export async function updateUserPreference(data: { userId: number; name: string; stringValue: string; numberValue: number; dateValue: Date }) {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.stringValue !== undefined) updateData.stringValue = data.stringValue;
    if (data.numberValue !== undefined) updateData.numberValue = data.numberValue;
    if (data.dateValue !== undefined) updateData.dateValue = data.dateValue;

    const [updated] = await db
        .update(userPreferences)
        .set(updateData)
        .where(
            and(
                eq(userPreferences.userId, updateData.userId),
                eq(userPreferences.name, updateData.name)
            )
        )
        .returning();

    return updated;
}

export async function deleteUserPreferenceById(id: number) {
    await db.delete(userPreferences).where(eq(userPreferences.id, id));
}

export async function saveCategorySlots(userId: number, preferences: { name: string; numberValue: number | null }[]) {
    await db.transaction(async (tx) => {
        for (const pref of preferences) {
            await tx.update(userPreferences)
                .set({ numberValue: pref.numberValue })
                .where(and(eq(userPreferences.userId, userId), eq(userPreferences.name, pref.name)));
        }
    });
}
