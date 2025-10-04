// app/api/teams/[teamId]/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { AccountsParams, AccountsQuery, CreateAccountBody } from '@/lib/http/accounts/accountSchemas';
import {AccountService} from "@/lib/services/account/accountService";
import {makeAccountsController} from "@/lib/http/accounts/accountsController";
import {AccountInsert} from "@/app/meta/insertModel";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const teamId = sp.get("teamId");

    const p = AccountsParams.safeParse({ teamId });
    if (!p.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid teamId" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const q = AccountsQuery.safeParse({
        includeArchived: sp.get("includeArchived") ?? undefined,
    });
    if (!q.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid query" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const result = await controller.listAccounts(p.data.teamId, q.data);
    return new NextResponse(JSON.stringify(result.body), {
        status: result.status,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountsParams.safeParse({ teamId: teamId });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = CreateAccountBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const accountBody: AccountInsert = {
        teamId: p.data.teamId,
        name: b.data.name ?? "",
        type: b.data.type ?? "",
        currency: b.data.currency,
    }

    const result = await controller.createAccount(p.data.teamId, accountBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
