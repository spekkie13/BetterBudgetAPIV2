import { NextRequest } from 'next/server';
import {AccountService} from "@/adapters/services/accountService";
import {makeAccountsController} from "@/adapters/controllers/accountsController";
import {AccountBody, AccountInsert, AccountParams, AccountQuery} from "@/db/types/accountTypes";
import {ok, fail, isRequestSuccessful} from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const teamId = searchParams.get("teamId");

    const parsedParams = AccountParams.safeParse({ teamId: teamId });
    if (!parsedParams.success)
        return fail(400, 'Invalid params');

    const parsedQuery = AccountQuery.safeParse({
        teamId: teamId,
        includeArchived: searchParams.get("includeArchived") ?? false,
    });
    if (!parsedQuery.success)
        return fail(400, 'Invalid query');

    const result = await controller.listAccounts(parsedParams.data.teamId, parsedQuery.data.includeArchived);
    return isRequestSuccessful(result.status) ? ok(result) : fail(result.status, result.message);
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = AccountParams.safeParse({ teamId: teamId });
    if (!params.success)
        return fail(400, 'Invalid Team ID');

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = AccountBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(400, 'Invalid Body');

    const accountBody: AccountInsert = {
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        type: parsedBody.data.type ?? "",
        currency: parsedBody.data.currency,
    }

    const result = await controller.createAccount(params.data.teamId, accountBody);
    return isRequestSuccessful(result.status) ? ok(result) : fail(result.status, result.message);
}
