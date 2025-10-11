import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { SpendTrendParams, SpendTrendQuery } from "@/db/types/trendTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;

    const paramsParsed = SpendTrendParams.safeParse({ teamId: teamId });
    if (!paramsParsed.success)
        return fail(req, 400, 'Invalid Team ID');

    const sp = new URL(req.url).searchParams;
    const queryParsed = SpendTrendQuery.safeParse({ months: sp.get('months') ?? '6' });
    if (!queryParsed.success)
        return fail(req, 400, 'Invalid months');

    const result = await controller.getSpendTrend(paramsParsed.data.teamId, queryParsed.data.months);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
