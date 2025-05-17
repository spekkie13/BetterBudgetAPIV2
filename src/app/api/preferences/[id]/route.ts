import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    deleteUserPreferenceById,
    getUserPreferenceById,
    updateUserPreference,
} from '@/lib/services/preferenceService';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'Missing ID' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    const preference = await getUserPreferenceById(id);
    return jsonWithCors(preference || {}, preference ? 200 : 404);
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.id || isNaN(body.id)) {
            return jsonWithCors({ error: 'Missing or invalid ID' }, 400);
        }

        const updated = await updateUserPreference(body);
        return jsonWithCors(updated);
    } catch (error) {
        console.error('Error updating preference:', error);
        return jsonWithCors({ error: 'Failed to update preference' }, 400);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'Missing ID' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    await deleteUserPreferenceById(id);
    return jsonWithCors({ message: 'Preference deleted' });
}
