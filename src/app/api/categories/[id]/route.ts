import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as categoryService from '@/lib/services/categoryService';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    const body = await req.json();
    const updated = await categoryService.updateCategory({ ...body, id });

    return jsonWithCors(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    await categoryService.deleteCategoryById(id);
    return jsonWithCors({ message: 'Category deleted' });
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
