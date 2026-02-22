import { NextRequest } from 'next/server';
import { AccountBody, AccountInsert } from "@/db/types/accountTypes";
import { ok, fail, preflightResponse, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import {AppError, InvalidTokenError, TeamNotFoundError} from "@/models/errors";
import {Response} from "@/core/http/Response";
import {accountService} from "@/service/accountService";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const searchParams: URLSearchParams = new URL(req.url).searchParams;
        const includeArchived = searchParams.has("includeArchived");

        const accounts = await accountService.listAccounts(team.id, includeArchived);
        return ok(req, accounts);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const reqBody = await req.json().catch(() => ({}));
        const parsedBody = AccountBody.safeParse(reqBody);
        if (!parsedBody.success)
            return fail(req, 400, 'Invalid Body');

        const accountBody: AccountInsert = {
            teamId: team.id,
            name: parsedBody.data.name ?? "",
            type: parsedBody.data.type ?? "",
            currency: parsedBody.data.currency,
        }

        const createdAccount = await accountService.createAccount(accountBody);
        return ok(req, createdAccount);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
