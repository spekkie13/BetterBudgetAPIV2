import { NextRequest } from 'next/server';
import {ok, fail, preflightResponse, getUserDataByToken} from "@/core/http/ApiHelpers";
import { Team, UserWithTeam } from "@/models";
import { UserBody } from "@/db/types/userTypes";
import {AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError} from "@/models/errors";
import {Response} from "@/core/http/Response";
import {userService} from "@/service/userService";

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

        return ok(req, userWithTeam);
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
        const body = await req.json().catch(() => ({}));
        const parsed = UserBody.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const createdUser = await userService.createUser(parsed.data);
        return ok(req, createdUser);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
