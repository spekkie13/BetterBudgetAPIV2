// File: /app/api/preferences/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {
    deleteUserPreferenceById,
    getUserPreferenceById,
    updateUserPreference
} from "@/lib/services/preferenceService";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const preference = await getUserPreferenceById(id)
        return jsonWithCors(preference || {}, preference ? 200 : 404);
    }
}

export async function PUT(req: NextRequest) {
    const body = await req.json();

    const updated = await updateUserPreference(body)
    return jsonWithCors(updated);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        await deleteUserPreferenceById(id)
        return jsonWithCors({ message: 'Preference deleted' });
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
