// app/api/user-settings/route.ts (or wherever your route lives)
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import {
    getUserSettingsByUserId,
    getPreference,
    setPreference,
    upsertUserSettings,
    saveCategorySlots,
} from '@/lib/services/userSettingsService';
import { ok, fail } from '@/lib/utils/apiResponse';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/user-settings?userId=123[&preferenceName=foo]
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('userId') ?? NaN);
    const preferenceName = searchParams.get('preferenceName') ?? undefined;

    try {
        if (!Number.isInteger(userId)) return fail('Invalid query params', 400);

        if (preferenceName) {
            const value = await getPreference(userId, preferenceName);
            return value !== null ? ok({ name: preferenceName, value }) : fail('Preference not found', 404);
        }

        const settings = await getUserSettingsByUserId(userId);
        return settings ? ok(settings) : fail('Settings not found', 404);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return fail('Internal server error', 500);
    }
}

/**
 * POST – upsert settings
 * Accepts either:
 *  A) whole/partial settings upsert:
 *     { userId, theme?: string|null, textSize?: string|null, preferences?: Record<string, any>|null }
 *  B) single preference key set:
 *     { userId, name: string, value: any }
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const userId = Number(body?.userId ?? NaN);
        if (!Number.isInteger(userId)) return fail('Invalid input (userId)', 400);

        // Single-key write
        if (typeof body?.name === 'string' && 'value' in body) {
            const updated = await setPreference(userId, body.name, body.value);
            return ok(updated, 'Preference saved', 201);
        }

        // Whole/partial settings upsert
        const updated = await upsertUserSettings({
            userId,
            theme: body?.theme ?? undefined,
            textSize: body?.textSize ?? undefined,
            preferences: body?.preferences ?? undefined,
        });
        return ok(updated, 'Settings saved', 201);
    } catch (error) {
        console.error('Error saving user settings:', error);
        return fail('Internal server error', 500);
    }
}

/**
 * PATCH – specialized helper to update category slots
 * Body: { userId: number, preferences: { name: string; numberValue: number|null }[] }
 * Writes to preferences.categorySlots[key] = number|null
 */
export async function PATCH(req: NextRequest) {
    try {
        const { userId, preferences } = await req.json();

        if (!Number.isInteger(userId) || !Array.isArray(preferences)) {
            return fail('Invalid input', 400);
        }

        await saveCategorySlots(userId, preferences);
        return ok({}, 'Category slots updated', 201);
    } catch (error) {
        console.error('PATCH error:', error);
        return fail('Internal server error', 500);
    }
}
