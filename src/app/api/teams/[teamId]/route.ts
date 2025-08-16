import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { TeamIdParams, UpdateTeamBody } from '@/lib/http/teams/teamIdSchemas';
import { getTeamByIdController, updateTeamController, deleteTeamController } from '@/lib/http/teams/teamsController';

export async function GET(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamIdParams.safeParse({ id: id });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const result = await getTeamByIdController(parsed.data);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = TeamIdParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const bodyParsed = UpdateTeamBody.safeParse(body);
    if (!bodyParsed.success) return new NextResponse(JSON.stringify({ error: 'Missing/invalid name' }), { status: 400, headers: corsHeaders });

    const result = await updateTeamController(params.data, bodyParsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamIdParams.safeParse({ id: id });
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers: corsHeaders });

    const result = await deleteTeamController(parsed.data);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
