import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { handleGet } from '@/lib/http/shared/handle';
import { CategoryQuery } from '@/lib/http/categories/categorySchemas';
import {
    getCategoriesController,
    createCategoryController,
    updateCategoryController, deleteCategoryController
} from '@/lib/http/categories/categoryController';

async function readJsonIfAny(req: NextRequest) {
    return req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
}

export async function GET(req: NextRequest) {
    return handleGet(req, CategoryQuery, getCategoriesController);
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const result = await createCategoryController(body);
        return new NextResponse(
            result.body === null ? null : JSON.stringify(result.body),
            { status: result.status, headers: corsHeaders }
        );
    } catch (e) {
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
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
