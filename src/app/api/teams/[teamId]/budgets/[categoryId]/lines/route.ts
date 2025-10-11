import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { LinesParams, LinesQuery } from "@/db/types/linesTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId, categoryId } = (ctx as { params: { teamId: string; categoryId: string; } }).params;

    const paramsParsed = LinesParams.safeParse({ teamId: teamId, categoryId: categoryId });
    if (!paramsParsed.success)
        return fail(400, 'Invalid Params');

    const sp = new URL(req.url).searchParams;
    const queryParsed = LinesQuery.safeParse({
        month: sp.get('month') ?? '',
        limit: sp.get('limit') ?? '50',
        cursor: sp.get('cursor'),
    });

    if (!queryParsed.success || queryParsed.data.month === undefined)
        return fail(400, 'Invalid Query');

    const result = await controller.getCategoryLines(
        paramsParsed.data.teamId,
        paramsParsed.data.categoryId,
        queryParsed.data.month,
        queryParsed.data.limit,
        queryParsed.data.cursor
    )

    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal Server Error');
}

export async function OPTIONS() {
    return ok(null, 'OK', 204);
}
