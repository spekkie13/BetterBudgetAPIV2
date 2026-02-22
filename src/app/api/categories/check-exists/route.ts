import { NextRequest } from 'next/server';
import { CategoryParams } from "@/db/types/categoryTypes";
import { ok, fail, preflightResponse, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import {categoryService} from "@/service/categoryService";
import {AppError, BadRequestError, InvalidTokenError, TeamNotFoundError, ZodValidationError} from "@/models/errors";
import {Response} from "@/core/http/Response";

export async function POST(req: NextRequest, ctx: any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = (ctx as { params: { id: string } }).params;

        const params = CategoryParams.safeParse({ id: id });
        if (!params.success) {
            const errors = params.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }
        if (params.data.id === null || params.data.id === undefined) {
            throw new BadRequestError('Invalid Params for check-category-exists route');
        }

        const exists = await categoryService.categoryExists(team.id, params.data.id);
        return ok(req, exists);
    } catch(error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
