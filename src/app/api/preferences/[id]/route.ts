// app/api/user-settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    getUserSettingsByUserId,
    upsertUserSettings,
    patchUserSettings,
    // If you didn't add this yet, it's a simple delete-by-userId in the service.
    deleteUserSettingsByUserId,
} from '@/lib/services/userSettingsService';

// GET /api/user-settings?userId=123
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('userId') ?? NaN);

    try {
        if (!Number.isInteger(userId)) {
            return jsonWithCors({ error: 'Invalid or missing userId' }, 400);
        }

        const settings = await getUserSettingsByUserId(userId);
        return jsonWithCors(settings ?? {}, settings ? 200 : 404);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// PUT /api/user-settings
// Body: { userId: number, theme?: 'light'|'dark'|'system', textSize?: 'S'|'M'|'L', preferences?: Record<string, unknown> }
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = Number(body?.userId ?? NaN);
        if (!Number.isInteger(userId)) {
            return jsonWithCors({ error: 'Missing or invalid userId' }, 400);
        }

        const updated = await upsertUserSettings({
            userId,
            theme: body?.theme,
            textSize: body?.textSize,
            preferences: body?.preferences,
        });

        return jsonWithCors(updated, 200);
    } catch (error) {
        console.error('Error upserting user settings:', error);
        return jsonWithCors({ error: 'Failed to upsert settings' }, 400);
    }
}

// PATCH /api/user-settings
// Body: { userId: number, theme?: string|null, textSize?: string|null, preferences?: Record<string, unknown>|null }
export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const userId = Number(body?.userId ?? NaN);
        if (!Number.isInteger(userId)) {
            return jsonWithCors({ error: 'Missing or invalid userId' }, 400);
        }

        const patched = await patchUserSettings(userId, {
            theme: body?.theme,
            textSize: body?.textSize,
            preferences: body?.preferences,
        });

        return jsonWithCors(patched, 200);
    } catch (error) {
        console.error('Error patching user settings:', error);
        return jsonWithCors({ error: 'Failed to patch settings' }, 400);
    }
}

// DELETE /api/user-settings?userId=123
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('userId') ?? NaN);

    if (!Number.isInteger(userId)) {
        return jsonWithCors({ error: 'Invalid userId' }, 400);
    }

    try {
        // If you prefer not to physically delete, you could instead:
        // await patchUserSettings(userId, { preferences: {} });
        await deleteUserSettingsByUserId(userId);
        return jsonWithCors({ message: 'Deleted' }, 200);
    } catch (e) {
        console.error('DELETE error:', e);
        return jsonWithCors({ error: 'Failed to delete' }, 500);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
