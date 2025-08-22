import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { handleGet } from '@/lib/http/shared/handle';
import { CategoryQuery } from '@/lib/http/categories/categorySchemas';
import { getCategoriesController, createCategoryController } from '@/lib/http/categories/categoryController';

export async function GET(req: NextRequest) {
    return handleGet(req, CategoryQuery, getCategoriesController);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log(body)
        const result = await createCategoryController(body);
        console.log(result)
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

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
