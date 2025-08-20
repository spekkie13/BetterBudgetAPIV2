// app/api/teams/[teamId]/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { AccountsParams, AccountsQuery, CreateAccountBody } from '@/lib/http/accounts/accountSchemas';
import { listAccountsController, createAccountController } from '@/lib/http/accounts/accountsController';

export async function GET(req: NextRequest, ctx: { params: { teamId: string } }) {
    const p = AccountsParams.safeParse({ teamId: ctx.params.teamId });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const q = AccountsQuery.safeParse({ includeArchived: sp.get('includeArchived') ?? undefined });
    if (!q.success) return new NextResponse(JSON.stringify({ error: 'Invalid query' }), { status: 400, headers: corsHeaders });

    const result = await listAccountsController(p.data.teamId, q.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest, ctx: { params: { teamId: string } }) {
    const p = AccountsParams.safeParse({ teamId: ctx.params.teamId });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = CreateAccountBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const result = await createAccountController(p.data.teamId, b.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
