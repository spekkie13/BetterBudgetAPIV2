import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {deleteResultById, getResultById, updateResult} from '@/lib/services/resultService';

// GET /api/results/[id]?id=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const userIdParam = searchParams.get('userId');

    if (idParam && userIdParam) {
        const id = parseInt(idParam);
        const userId = parseInt(userIdParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const results = await getResultById(userId, id)

        if (!results){
            return jsonWithCors({ error: 'No results found'}, 404)
        }

        return jsonWithCors(results)
    }
}

// PUT /api/results/[id]?id=...
export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);
        const body = await req.json();

        const updated = await updateResult({
            id,
            ...body,
        });

        return jsonWithCors(updated);
    }
}

// DELETE /api/results/[id]?id=...
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        await deleteResultById(id);
        return jsonWithCors({ message: 'Result deleted' });
    }
}

// Handle OPTIONS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
