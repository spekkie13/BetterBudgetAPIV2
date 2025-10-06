import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import {TeamBody, TeamQuery} from "@/db/types/teamTypes";
import {TeamService} from "@/adapters/services/teamService";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = TeamQuery.safeParse({ teamId: sp.get('teamId') ?? undefined });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders });

    let result = null;
    if (parsed.data.id !== undefined) {
        result = await controller.getTeamById(parsed.data.id);
        return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
    }
    result = await controller.selectAll();
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = TeamBody.safeParse(body);
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Missing team name' }), { status: 400, headers: corsHeaders });

    const result = await controller.createTeam(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
