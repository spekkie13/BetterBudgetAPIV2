import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { SpendTrendParams, SpendTrendQuery } from "@/db/types/trendTypes";
import { TeamService } from "@/adapters/services/teamService";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;

    const paramsParsed = SpendTrendParams.safeParse({ teamId: teamId });
    if (!paramsParsed.success) return new NextResponse(JSON.stringify({ error: 'Bad teamId' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const queryParsed = SpendTrendQuery.safeParse({ months: sp.get('months') ?? '6' });
    if (!queryParsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid months' }), { status: 400, headers: corsHeaders });

    const result = await controller.getSpendTrend(paramsParsed.data.teamId, queryParsed.data.months);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
