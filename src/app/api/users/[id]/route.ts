import { NextRequest } from 'next/server';
import { ok, fail, preflightResponse, getUserDataByToken} from "@/core/http/ApiHelpers";
import { UserBody } from "@/db/types/userTypes";
import { UserWithTeam, User } from "@/models";
import {AppError, InvalidTokenError, UserNotFoundError, ZodValidationError} from "@/models/errors";
import {Response} from "@/core/http/Response";
import {userService} from "@/service/userService";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            return fail(req, 401, 'Invalid token');

        const user: User = userWithTeam.user;
        return ok(req, user);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const user: User = userWithTeam.user;
        if (!user)
            throw new UserNotFoundError();

        const body = await req.json().catch(() => ({}));
        const parsed = UserBody.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }
        const updatedUser = await userService.updateUser(user.id, parsed.data);
        return ok(req, updatedUser);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            return fail(req, 401, 'Invalid token');

        const user: User = userWithTeam.user;

        await userService.deleteUser(user.id);
        return ok(req, {}, 'User deleted');
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
