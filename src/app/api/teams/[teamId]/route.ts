import { NextRequest } from 'next/server';
import { TeamBody, TeamParams, TeamPatch } from "@/db/types/teamTypes";
import {ok, preflightResponse, toApiResponse} from "@/core/http/ApiHelpers";
import {teamService} from "@/service/teamService";
import {AppError, ZodValidationError} from "@/models/errors";

type RouteContext = { params: { teamId: string } };

export async function GET(req: NextRequest, { params }: RouteContext) {
    try {
        const { teamId: id } = params;

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
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
    try {
        const { teamId: id } = params;

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
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
    try {
        const { teamId: id } = params;

        const parsed = TeamParams.safeParse({ id: id });
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        await teamService.deleteTeam(parsed.data.id);
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
