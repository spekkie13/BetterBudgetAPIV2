import { NextRequest } from 'next/server';
import { categoryService } from "@/service/categoryService";
import { CategoryBody, CategoryInsert, CategoryParams, CategoryQuery } from "@/db/types/categoryTypes";
import {ok, preflightResponse, getUserDataByToken, toApiResponse} from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import {AppError, BadRequestError, InvalidTokenError, TeamNotFoundError, ZodValidationError} from "@/models/errors";

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const searchParams = new URL(req.url).searchParams;
        const id = searchParams.get("id");
        const type = searchParams.get("type");

        const parsedQuery = CategoryQuery.safeParse({
            teamId: team.id,
            id: id,
            type: type
        });

        if (!parsedQuery.success) {
            const errors = parsedQuery.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const category = await categoryService.getCategoryById(parsedQuery.data.teamId, parsedQuery.data.id)
        return ok(req, category);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const sp = new URL(req.url).searchParams;
        const id = sp.get("id");

        const params = CategoryParams.safeParse({ id: id });
        if (!params.success) {
            const errors = params.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const reqBody = await req.json().catch(() => ({}));
        const parsedBody = CategoryBody.safeParse(reqBody);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const categoryBody: CategoryInsert = {
            id: params.data.id,
            teamId: team.id,
            name: parsedBody.data.name ?? "",
            color: parsedBody.data.color ?? "",
            type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
            icon: parsedBody.data.icon ?? "",
            parentId: parsedBody.data.parentId ?? 0,
        };

        const updatedCategory = await categoryService.updateCategory(team.id, params.data.id ?? 0, categoryBody);
        return ok(req, updatedCategory);
    } catch(error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
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
        const parsedBody = CategoryBody.safeParse(reqBody);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const categoryBody: CategoryInsert = {
            teamId: team.id,
            name: parsedBody.data.name ?? "",
            color: parsedBody.data.color ?? "",
            type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
            icon: parsedBody.data.icon ?? "",
            parentId: parsedBody.data.parentId,
        };

        const createdCategory = await categoryService.createCategory(categoryBody);
        return ok(req, createdCategory);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const id = new URL(req.url).searchParams.get("id");
        const parsedParams = CategoryParams.safeParse({ id: id });

        if (!parsedParams.success) {
            const errors = parsedParams.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }
        if (parsedParams.data.id === undefined)
            throw new BadRequestError('Invalid Params for delete category route');

        await categoryService.deleteCategory(team.id, parsedParams.data.id);
        return ok(req, {}, 'Successfully deleted', 204);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
