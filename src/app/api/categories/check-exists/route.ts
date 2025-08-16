import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { checkCategoryExistsController } from '@/lib/http/categories/categoryController';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const result = await checkCategoryExistsController(body);

        return new NextResponse(
            JSON.stringify(result.body),
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
