import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { TeamsQuery, CreateTeamBody } from '@/lib/http/teams/teamsSchemas';
import { listOrGetTeamController, createTeamController } from '@/lib/http/teams/teamsController';

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = TeamsQuery.safeParse({ teamId: sp.get('teamId') ?? undefined });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    const result = await listOrGetTeamController(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = CreateTeamBody.safeParse(body);
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Missing team name' }), { status: 400, headers: corsHeaders });

    const result = await createTeamController(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
