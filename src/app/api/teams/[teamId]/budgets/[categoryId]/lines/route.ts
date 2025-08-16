import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { LinesParams, LinesQuery } from '@/lib/http/teams/linesSchemas';
import { getCategoryLinesController } from '@/lib/http/teams/teamsController';

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
    if (!queryParsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid query' }), { status: 400, headers: corsHeaders });

    const result = await getCategoryLinesController(paramsParsed.data, queryParsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
