import { NextRequest } from 'next/server';
import { TeamBody, TeamQuery } from "@/db/types/teamTypes";
import {ok, preflightResponse, toApiResponse} from "@/core/http/ApiHelpers";
import {AppError, ZodValidationError} from "@/models/errors";
import {teamService} from "@/service/teamService";

export async function GET(req: NextRequest) {
    try {
        const sp = new URL(req.url).searchParams;
        const parsed = TeamQuery.safeParse({ id: sp.get('teamId') ?? undefined });
        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        let teams;
        if (parsed.data.id !== undefined)
            teams = await teamService.getTeamById(parsed.data.id);
        else
            teams = await teamService.listAll();

        return ok(req, teams);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }

}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const parsedBody = TeamBody.safeParse(body);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const createdTeam = await teamService.createTeam(parsedBody.data);
        return ok(req, createdTeam);
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
