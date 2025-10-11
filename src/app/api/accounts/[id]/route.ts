import { NextRequest } from 'next/server';
import { makeAccountsController } from "@/adapters/controllers/accountsController";
import { AccountService } from "@/adapters/services/accountService";
import { AccountBody, AccountInsert, AccountParams } from "@/db/types/accountTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";


const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!params.success)
        return fail(400, 'Invalid parameters')

    const result = await controller.getAccount(params.data.teamId, params.data.id);
    return isRequestSuccessful(result.status) ? ok(result) : fail(result.status, result.message);
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!params.success)
        return fail(400, 'Invalid parameters')

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = AccountBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(400, 'Invalid body')

    const accountBody: AccountInsert = {
        teamId: params.data.teamId,
        id: params.data.id,
        name: parsedBody.data.name ?? "",
        type: parsedBody.data.type ?? "",
        currency: parsedBody.data.currency,
        isArchived: parsedBody.data.isArchived ?? false,
    }
    const result = await controller.updateAccount(params.data.teamId, parsedBody.data.id, accountBody);
    return isRequestSuccessful(result.status) ? ok(result) : fail(result.status, result.message);
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = AccountParams.safeParse({ teamId: teamId, id: id });
    if (!p.success || p.data.id === null || p.data.id === undefined)
        return fail(400, 'Invalid parameters')

    const result = await controller.deleteAccount(p.data.teamId, p.data.id);
    return isRequestSuccessful(result.status) ? ok(result) : fail(result.status, result.message);
}
