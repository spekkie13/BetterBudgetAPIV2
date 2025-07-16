import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { createUserPreference, getUserPreferenceByName, getUserPreferencesByUserId, saveCategorySlots } from '@/lib/services/preferenceService';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = parseInt(searchParams.get('userId') || '');
    const preferenceName = searchParams.get('preferenceName');

    try {
        if(!isNaN(userId)){
            if(preferenceName){
                const pref = await getUserPreferenceByName(preferenceName, userId);
                return jsonWithCors(pref || {}, pref ? 200 : 404);
            }

            const preferences = await getUserPreferencesByUserId(userId);
            return jsonWithCors(preferences)
        }

        return jsonWithCors({ error: 'Invalid query params' }, 400);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const created = await createUserPreference(body);
        return jsonWithCors(created, 201);
    } catch (error) {
        console.error('Error creating preference:', error);
        return jsonWithCors({ error: 'Failed to create preference' }, 400);
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId, preferences } = await req.json();

        if (!userId || !Array.isArray(preferences)) {
            return jsonWithCors({ error: 'Invalid input' }, 400);
        }

        await saveCategorySlots(userId, preferences);
        return jsonWithCors({ success: true });
    } catch (e) {
        console.error('PATCH error:', e);
        return jsonWithCors({ error: 'Failed bulk update' }, 500);
    }
}
