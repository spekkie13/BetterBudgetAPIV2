import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { SpendTrendQuery } from "@/db/types/trendTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { Team, UserWithTeam } from "@/models";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const sp = new URL(req.url).searchParams;
    const queryParsed = SpendTrendQuery.safeParse({ months: sp.get('months') ?? '6' });
    if (!queryParsed.success)
        return fail(req, 400, 'Invalid months');

    const result = await controller.getSpendTrend(team.id, queryParsed.data.months);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
