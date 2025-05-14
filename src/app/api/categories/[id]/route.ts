// File: /app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as categoryService from '@/lib/services/categoryService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    if (idParam){
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const category = await categoryService.getCategoryById(id);
        return jsonWithCors(category || {}, category ? 200 : 404);
    }

    return jsonWithCors({ error: 'Invalid ID' }, 400);
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if(idParam){
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const body = await req.json();

        const updated = await categoryService.updateCategory({ ...body, id });
        return jsonWithCors(updated);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if(idParam){
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        await categoryService.deleteCategoryById(id);
        return jsonWithCors({ message: 'Category deleted' });
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
