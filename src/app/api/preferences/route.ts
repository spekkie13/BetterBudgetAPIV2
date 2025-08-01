import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { createUserPreference, getUserPreferenceByName, getUserPreferencesByUserId, saveCategorySlots } from '@/lib/services/preferenceService';
import { ok, fail } from "@/lib/utils/apiResponse";

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
        console.log(userId)
        if(!isNaN(userId)){
            if(preferenceName){
                const pref = await getUserPreferenceByName(preferenceName, userId);
                return pref ? ok(pref) : fail('Invalid user preference', 404);
            }

            const preferences = await getUserPreferencesByUserId(userId);
            return preferences ? ok(preferences) : fail('Invalid user preference', 404);
        }

        return fail('Invalid query params', 400)
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return fail('Internal server error', 500)
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const created = await createUserPreference(body);
        return ok(created, 'Successfully created user preference', 201);
    } catch (error) {
        console.error('Error creating preference:', error);
        return fail('Internal server error', 500)
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId, preferences } = await req.json();

        if (!userId || !Array.isArray(preferences)) {
            return fail('Invalid input', 404);
        }

        await saveCategorySlots(userId, preferences);
        return ok({}, 'Successfully updated user preference', 201);
    } catch (e) {
        console.error('PATCH error:', e);
        return fail('Internal server error', 500)
    }
}
