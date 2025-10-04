import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { patchCategorySlotsController } from '@/lib/http/userSettings/categorySlotsController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await patchCategorySlotsController(body);
    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}
