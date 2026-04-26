import { NextRequest } from "next/server";
import { ResultBody, ResultQuery } from "@/db/types/resultTypes";
import { resultService } from "@/service/resultService";
import { ok, preflightResponse, getUserDataByToken, toApiResponse } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";
import { AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError } from "@/models/errors";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team) throw new TeamNotFoundError();

        const sp = new URL(req.url).searchParams;
        const query = ResultQuery.safeParse({
            periodId: sp.get("periodId"),
            categoryId: sp.get("categoryId") ?? undefined,
        });
        if (!query.success) {
            throw new ZodValidationError(query.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })));
        }

        const results = await resultService.getResults(team.id, query.data.periodId, query.data.categoryId);
        return ok(req, results);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team) throw new TeamNotFoundError();

        const body = await req.json().catch(() => ({}));
        const parsed = ResultBody.safeParse(body);
        if (!parsed.success) {
            throw new ZodValidationError(parsed.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })));
        }

        const result = await resultService.upsertResult({
            teamId: team.id,
            periodId: parsed.data.periodId,
            categoryId: parsed.data.categoryId,
            budgetedCents: parsed.data.budgetedCents,
            actualCents: parsed.data.actualCents,
            carryoverCents: parsed.data.carryoverCents,
        });
        return ok(req, result);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}