import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { deleteCategoryController } from '@/lib/http/categories/categoryController';


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
