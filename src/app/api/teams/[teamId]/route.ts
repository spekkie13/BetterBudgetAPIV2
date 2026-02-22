import { NextRequest } from 'next/server';
import { TeamBody, TeamParams, TeamPatch } from "@/db/types/teamTypes";
import { ok, fail, preflightResponse } from "@/core/http/ApiHelpers";
import {teamService} from "@/service/teamService";
import {AppError, ZodValidationError} from "@/models/errors";
import {Response} from "@/core/http/Response";

export async function GET(req: NextRequest, ctx: any) {
    try {
        const { id } = (ctx as { params: { id: string } }).params;

        const parsedParams = TeamParams.safeParse({ id: id });
        if (!parsedParams.success) {
            const errors = parsedParams.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const team = await teamService.getTeamById(parsedParams.data.id);
        return ok(req, team);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function PUT(req: NextRequest, ctx: any) {
    try {
        const { id } = (ctx as { params: { id: string } }).params;

        const parsedParams = TeamParams.safeParse({ id: id });
        if (!parsedParams.success) {
            const errors = parsedParams.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const body = await req.json().catch(() => ({}));
        const parsedBody = TeamBody.safeParse(body);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const updateBody: TeamPatch = {
            id: parsedParams.data.id,
            name: parsedBody.data.name ?? "",
            createdAt: new Date(parsedBody.data.createdAt) ?? new Date(),
        }

        const updatedTeam = await teamService.updateTeam(parsedParams.data.id, updateBody);
        return ok(req, updatedTeam);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function DELETE(req: NextRequest, ctx: any) {
    try {
        const { id } = (ctx as { params: { id: string } }).params;

        const parsed = TeamParams.safeParse({ id: id });
        if (!parsed.success)
            return fail(req, 400, 'Invalid ID');

        await teamService.deleteTeam(parsed.data.id);
        return ok(req, 200, 'Successfully deleted');
    } catch (error) {
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
