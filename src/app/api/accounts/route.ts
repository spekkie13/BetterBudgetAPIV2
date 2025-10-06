import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {AccountService} from "@/adapters/services/accountService";
import {makeAccountsController} from "@/adapters/controllers/accountsController";
import {AccountBody, AccountInsert, AccountParams, AccountQuery} from "@/db/types/accountTypes";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const teamId = searchParams.get("teamId");

    const parsedParams = AccountParams.safeParse({ teamId });
    if (!parsedParams.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid teamId" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const parsedQuery = AccountQuery.safeParse({
        includeArchived: searchParams.get("includeArchived") ?? false,
    });

    if (!parsedQuery.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid query" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const result = await controller.listAccounts(parsedParams.data.teamId, parsedQuery.data);
    return new NextResponse(JSON.stringify(result.body), {
        status: result.status,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = AccountParams.safeParse({ teamId: teamId });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = AccountBody.safeParse(reqBody);
    if (!parsedBody.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const accountBody: AccountInsert = {
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        type: parsedBody.data.type ?? "",
        currency: parsedBody.data.currency,
    }

    const result = await controller.createAccount(params.data.teamId, accountBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
