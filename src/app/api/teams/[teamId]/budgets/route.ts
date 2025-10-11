import { NextRequest } from 'next/server';
import { BudgetParams, BudgetQuery } from "@/db/types/budgetTypes";
import { TeamService } from "@/adapters/services/teamService";
import { makeTeamsController } from "@/adapters/controllers/teamsController";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;

    const paramsParsed = BudgetParams.safeParse({ teamId: teamId });
    if (!paramsParsed.success)
        return fail(req, 400, 'Invalid Team ID');

    const sp = new URL(req.url).searchParams;
    const queryParsed = BudgetQuery.safeParse({ month: sp.get('month') ?? '' });
    if (!queryParsed.success || queryParsed.data.periodMonth === undefined)
        return fail(req, 400, 'Invalid Month');

    const result = await controller.getBudget(paramsParsed.data.teamId, queryParsed.data.periodMonth);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
