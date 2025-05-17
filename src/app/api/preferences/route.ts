import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    createUserPreference,
    getUserPreferenceById,
    getUserPreferenceByName,
    getUserPreferencesByUserId,
} from '@/lib/services/preferenceService';
import { prisma } from '@/lib/prisma';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const preferenceIdParam = searchParams.get('preferenceId');
    const userIdParam = searchParams.get('userId');
    const preferenceName = searchParams.get('preferenceName');

    try {
        if (preferenceIdParam) {
            const preferenceId = parseInt(preferenceIdParam);
            if (isNaN(preferenceId)) return jsonWithCors({ error: 'Invalid preferenceId' }, 400);

            const preference = await getUserPreferenceById(preferenceId);
            return jsonWithCors(preference || {}, preference ? 200 : 404);
        }

        if (userIdParam) {
            const userId = parseInt(userIdParam);
            if (isNaN(userId)) return jsonWithCors({ error: 'Invalid userId' }, 400);

            if (preferenceName) {
                const pref = await getUserPreferenceByName(preferenceName, userId);
                return jsonWithCors(pref || {}, pref ? 200 : 404);
            }

            const preferences = await getUserPreferencesByUserId(userId);
            return jsonWithCors(preferences);
        }

        // fallback: all preferences (should rarely be used)
        const allPreferences = await prisma.userPreference.findMany();
        return jsonWithCors(allPreferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newPref = await createUserPreference(body);
        return jsonWithCors(newPref, 201);
    } catch (error) {
        console.error('Error creating preference:', error);
        return jsonWithCors({ error: 'Failed to create preference' }, 400);
    }
}
