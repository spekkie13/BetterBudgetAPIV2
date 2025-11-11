import { NextRequest } from 'next/server';
import { makeAccountsController } from "@/adapters/controllers/accountsController";
import { AccountService } from "@/adapters/services/accountService";
import { AccountBody, AccountInsert } from "@/db/types/accountTypes";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";

const svc = new AccountService();
const controller = makeAccountsController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const { id } = (ctx as { params: { id: string } }).params;
    const result = await controller.getAccount(team.id, Number(id));
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function PUT(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const { id } = (ctx as { params: { id: string } }).params;
    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = AccountBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body')

    const accountBody: AccountInsert = {
        teamId: team.id,
        id: Number(id),
        name: parsedBody.data.name ?? "",
        type: parsedBody.data.type ?? "",
        currency: parsedBody.data.currency,
        isArchived: parsedBody.data.isArchived ?? false,
    }
    const result = await controller.updateAccount(team.id, parsedBody.data.id, accountBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function DELETE(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { id } = (ctx as { params: { id: string } }).params;
    const result = await controller.deleteAccount(team.id, Number(id));
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}
