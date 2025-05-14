// File: /app/api/preferences/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { prisma } from '@/lib/prisma';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {
    createUserPreference,
    getUserPreferenceById, getUserPreferenceByName,
    getUserPreferencesByUserId
} from "@/lib/services/userpreferenceService";

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

// GET /api/preferences or /api/preferences?userId=... or /api/preferences?preferenceId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const preferenceIdParam = searchParams.get('preferenceId');
    const userIdParam = searchParams.get('userId');
    const preferenceName = searchParams.get('preferenceName');

    try {
        if (preferenceIdParam) {
            const preferenceId = parseInt(preferenceIdParam);
            if (isNaN(preferenceId)) return jsonWithCors({ error: 'Invalid preferenceId' }, 400);

            const preference = await getUserPreferenceById(preferenceId)

            return jsonWithCors(preference ? preference : {});
        }
        if (userIdParam) {
            const userId = parseInt(userIdParam);
            if (isNaN(userId)) return jsonWithCors({ error: 'Invalid userId' }, 400);
            if(preferenceName){
                const preference = await getUserPreferenceByName(preferenceName, userId);
                if(!preference){
                    return jsonWithCors({ error: 'Invalid preference name' }, 400);
                }
                return jsonWithCors(preference);
            }else {
                const preference = await getUserPreferencesByUserId(userId);
                return jsonWithCors(preference ? preference : {});
            }
        }

        const allPreferences = await prisma.userPreference.findMany();
        return jsonWithCors(allPreferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/preferences
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newPref = await createUserPreference(body)
        return jsonWithCors(newPref, 201);
    } catch (error) {
        console.error('Error creating preference:', error);
        return jsonWithCors({ error: 'Failed to create preference' }, 400);
    }
}
