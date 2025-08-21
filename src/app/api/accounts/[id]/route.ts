// app/api/teams/[teamId]/accounts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { AccountIdParams, UpdateAccountBody } from '@/lib/http/accounts/accountSchemas';
import { getAccountController, updateAccountController, deleteAccountController } from '@/lib/http/accounts/accountsController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await getAccountController(p.data.teamId, p.data.id);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = UpdateAccountBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const result = await updateAccountController(p.data.teamId, p.data.id, b.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await deleteAccountController(p.data.teamId, p.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
