import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { AccountIdParams, UpdateAccountBody } from '@/lib/http/accounts/accountSchemas';
import {makeAccountsController} from "@/lib/http/accounts/accountsController";
import {AccountService} from "@/lib/services/account/accountService";
import {AccountInsert} from "@/app/meta/insertModel";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.getAccount(p.data.teamId, p.data.id);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = UpdateAccountBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const accountBody: AccountInsert = {
        teamId: p.data.teamId,
        id: p.data.id,
        name: b.data.name ?? "",
        type: b.data.type ?? "",
        currency: b.data.currency,
        isArchived: b.data.isArchived ?? false,
    }

    const result = await controller.updateAccount(p.data.teamId, p.data.id, accountBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountIdParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteAccount(p.data.teamId, p.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
