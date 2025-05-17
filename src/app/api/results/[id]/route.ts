import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    findResultsByFilter,
    updateResult,
    deleteResultById
} from '@/lib/services/resultService';

// GET /api/results/[id]?id=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const results = await findResultsByFilter({ id });
        return jsonWithCors(results.length > 0 ? results[0] : {}, results.length > 0 ? 200 : 404);
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
