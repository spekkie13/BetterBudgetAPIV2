import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {makeAccountsController} from "@/adapters/controllers/accountsController";
import {AccountService} from "@/adapters/services/accountService";
import {AccountBody, AccountInsert, AccountParams} from "@/db/types/accountTypes";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.getAccount(p.data.teamId, p.data.id);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = AccountBody.safeParse(reqBody);
    if (!parsedBody.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const accountBody: AccountInsert = {
        teamId: params.data.teamId,
        id: params.data.id,
        name: parsedBody.data.name ?? "",
        type: parsedBody.data.type ?? "",
        currency: parsedBody.data.currency,
        isArchived: parsedBody.data.isArchived ?? false,
    }

    const result = await controller.updateAccount(params.data.teamId, params.data.id, accountBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteAccount(p.data.teamId, p.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
