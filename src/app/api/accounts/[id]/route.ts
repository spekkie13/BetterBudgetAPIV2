import { NextRequest } from 'next/server';
import { AccountBody, AccountInsert } from "@/db/types/accountTypes";
import {ok, preflightResponse, getUserDataByToken, toApiResponse} from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import {AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError} from "@/models/errors";
import {accountService} from "@/service/accountService";

type RouteContext = { params: { id: string } };

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = params;
        const account = await accountService.getAccountById(team.id, Number(id));
        return ok(req, account);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = params;
        const reqBody = await req.json().catch(() => ({}));
        const parsedBody = AccountBody.safeParse(reqBody);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const accountBody: AccountInsert = {
            teamId: team.id,
            id: Number(id),
            name: parsedBody.data.name ?? "",
            type: parsedBody.data.type ?? "",
            currency: parsedBody.data.currency,
            isArchived: parsedBody.data.isArchived ?? false,
        }

        const updatedAccount = await accountService.updateAccount(team.id, Number(id), accountBody);
        return ok(req, updatedAccount);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = params;
        await accountService.deleteAccount(team.id, Number(id));
        return ok(req, {}, 'Deleted account');
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}
