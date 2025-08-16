import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { updateCategoryController, deleteCategoryController } from '@/lib/http/categories/categoryController';

// small helper
async function readJsonIfAny(req: NextRequest) {
    return req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
}

export async function PUT(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const body = await readJsonIfAny(req);

    const result = await updateCategoryController(searchParams, body);

    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}

export async function DELETE(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;

    const result = await deleteCategoryController(searchParams);

    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
