import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import {TeamBody, TeamParams, TeamPatch} from "@/db/types/teamTypes";
import {TeamService} from "@/adapters/services/teamService";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamParams.safeParse({ id: id });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const result = await controller.getTeamById(parsed.data.id);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = TeamParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const bodyParsed = TeamBody.safeParse(body);
    if (!bodyParsed.success) return new NextResponse(JSON.stringify({ error: 'Missing/invalid name' }), { status: 400, headers: corsHeaders });

    const updateBody: TeamPatch = {
        id: params.data.id,
        name: bodyParsed.data.name ?? "",
        createdAt: new Date(bodyParsed.data.createdAt) ?? new Date(),
    }
    const result = await controller.updateTeam(params.data.id, updateBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamParams.safeParse({ id: id });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteTeam(parsed.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
