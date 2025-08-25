import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { deleteBudgetController } from '@/lib/http/budgets/budgetController';

// Helper: read JSON body if present
async function readJsonIfAny(req: NextRequest) {
    return req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;
    // teamId can come from JSON body or ?teamId=
    const body = await readJsonIfAny(req);
    const sp = new URL(req.url).searchParams;
    const input = { teamId: body.teamId ?? sp.get('teamId') ?? undefined };

    const result = await deleteBudgetController(id, input);
    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
