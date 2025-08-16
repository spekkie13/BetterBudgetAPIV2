import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { BudgetParams, BudgetQuery } from '@/lib/http/teams/budgetSchemas';
import { getBudgetController } from '@/lib/http/teams/teamsController';

export async function GET(req: NextRequest, ctx: { params: { teamId: string } }) {
    const paramsParsed = BudgetParams.safeParse({ teamId: ctx.params.teamId });
    if (!paramsParsed.success) return new NextResponse(JSON.stringify({ error: 'Bad teamId' }), { status: 400, headers: corsHeaders });

    const sp = new URL(req.url).searchParams;
    const queryParsed = BudgetQuery.safeParse({ month: sp.get('month') ?? '' });
    if (!queryParsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid month' }), { status: 400, headers: corsHeaders });

    const result = await getBudgetController(paramsParsed.data, queryParsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
