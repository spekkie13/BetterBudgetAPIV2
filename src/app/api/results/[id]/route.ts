import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import {deleteResultById, getResultById, updateResult} from '@/lib/services/resultService';
import { ok, fail } from '@/lib/utils/apiResponse'
import { isValid } from '@/lib/helpers'

// GET /api/results/[id]?id=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const userIdParam = searchParams.get('userId');

    if (!isValid(userIdParam) || !isValid(idParam)) return fail('Provide a valid user ID')

    const id = parseInt(idParam!);
    const userId = parseInt(userIdParam!);

    if (isNaN(id)) return fail('Invalid ID', 400);

    const results = await getResultById(userId, id)
    return results ? ok(results) : fail('No results found', 404)
}

// PUT /api/results/[id]?id=...
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const updated = await updateResult(body)

        ok(updated)
    } catch (error) {
        console.error('Error updating result:', error);
        return fail('Failed updating result:');
    }
}

// DELETE /api/results/[id]?id=...
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return fail('Provide a valid id')

        await deleteResultById(id);
        return ok({}, 'Result deleted')
    }
}

// Handle OPTIONS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
