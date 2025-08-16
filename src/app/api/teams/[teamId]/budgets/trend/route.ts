import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { SpendTrendParams, SpendTrendQuery } from '@/lib/http/teams/trendSchemas';
import { getSpendTrendController } from '@/lib/http/teams/teamsController';

export async function GET(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;

    const paramsParsed = SpendTrendParams.safeParse({ teamId: teamId });
    if (!paramsParsed.success) return new NextResponse(JSON.stringify({ error: 'Bad teamId' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const queryParsed = SpendTrendQuery.safeParse({ months: sp.get('months') ?? '6' });
    if (!queryParsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid months' }), { status: 400, headers: corsHeaders });

    const result = await getSpendTrendController(paramsParsed.data, queryParsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
