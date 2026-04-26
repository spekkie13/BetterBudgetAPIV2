import { NextRequest } from "next/server";
import { PeriodBody, PeriodQuery } from "@/db/types/periodTypes";
import { periodService } from "@/service/periodService";
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
        const query = PeriodQuery.safeParse({ status: sp.get("status") ?? undefined });
        if (!query.success) {
            throw new ZodValidationError(query.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })));
        }

        const periods = await periodService.getPeriods(team.id, query.data.status);
        return ok(req, periods);
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
        const parsed = PeriodBody.safeParse(body);
        if (!parsed.success) {
            throw new ZodValidationError(parsed.error.issues.map(e => ({ field: e.path.join('.'), message: e.message })));
        }

        const period = await periodService.createPeriod({
            teamId: team.id,
            startDate: parsed.data.startDate,
            endDate: parsed.data.endDate,
            periodStartType: parsed.data.periodStartType,
        });
        return ok(req, period);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}