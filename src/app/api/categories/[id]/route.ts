import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as categoryService from '@/lib/services/categoryService';

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
    return jsonWithCors({ error: 'Invalid ID' }, 400);
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
    return jsonWithCors({ error: 'category not deleted, no ID provided'}, 400)
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
