import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { LinesParams, LinesQuery } from "@/db/types/linesTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { Team, UserWithTeam } from "@/models";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { categoryId } = (ctx as { params: { categoryId: string; } }).params;

    const paramsParsed = LinesParams.safeParse({ categoryId: categoryId });
    if (!paramsParsed.success)
        return fail(req, 400, 'Invalid Params');

    const sp = new URL(req.url).searchParams;
    const queryParsed = LinesQuery.safeParse({
        month: sp.get('month') ?? '',
        limit: sp.get('limit') ?? '50',
        cursor: sp.get('cursor'),
    });

    if (!queryParsed.success || queryParsed.data.month === undefined)
        return fail(req, 400, 'Invalid Query');

    const result = await controller.getCategoryLines(
        team.id,
        paramsParsed.data.categoryId,
        queryParsed.data.month,
        queryParsed.data.limit,
        queryParsed.data.cursor
    )

    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
