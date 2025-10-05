import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {BudgetParams, BudgetQuery} from "@/db/types/budgetTypes";
import {TeamService} from "@/adapters/services/teamService";
import {makeTeamsController} from "@/adapters/controllers/teamsController";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;

    const paramsParsed = BudgetParams.safeParse({ teamId: teamId });
    if (!paramsParsed.success) return new NextResponse(JSON.stringify({ error: 'Bad teamId' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const queryParsed = BudgetQuery.safeParse({ month: sp.get('month') ?? '' });
    if (!queryParsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid month' }), { status: 400, headers: corsHeaders });

    const result = await controller.getBudget(paramsParsed.data.teamId, queryParsed.data.periodMonth);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
