import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import {LinesParams, LinesQuery} from "@/db/types/linesTypes";
import {TeamService} from "@/adapters/services/teamService";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { teamId, categoryId } = (ctx as { params: { teamId: string; categoryId: string; } }).params;

    const paramsParsed = LinesParams.safeParse({ teamId: teamId, categoryId: categoryId });
    if (!paramsParsed.success) return new NextResponse(JSON.stringify({ error: 'Bad params' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const queryParsed = LinesQuery.safeParse({
        month: sp.get('month') ?? '',
        limit: sp.get('limit') ?? '50',
        cursor: sp.get('cursor'),
    });
    if (!queryParsed.success || queryParsed.data.month === undefined) return new NextResponse(JSON.stringify({ error: 'Invalid query' }), { status: 400, headers: corsHeaders });

    const result = await controller.getCategoryLines(
        paramsParsed.data.teamId,
        paramsParsed.data.categoryId,
        queryParsed.data.month,
        queryParsed.data.limit,
        queryParsed.data.cursor
    )
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
