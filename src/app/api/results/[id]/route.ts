import { NextRequest } from "next/server";
import { ResultPatchBody } from "@/db/types/resultTypes";
import { resultService } from "@/service/resultService";
import { ok, preflightResponse, getUserDataByToken, toApiResponse } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import { AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError } from "@/models/errors";

type IdRouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, { params }: IdRouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team) throw new TeamNotFoundError();

        const { id } = await params;
        const result = await resultService.getResultById(team.id, Number(id));
        return ok(req, result);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function PUT(req: NextRequest, { params }: IdRouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team) throw new TeamNotFoundError();

        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const parsed = ResultPatchBody.safeParse(body);
        if (!parsed.success) {
            throw new ZodValidationError(parsed.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })));
        }

        const result = await resultService.updateResult(team.id, Number(id), parsed.data);
        return ok(req, result);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}