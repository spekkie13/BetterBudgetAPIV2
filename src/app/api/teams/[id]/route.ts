import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { deleteTeam, getTeamById, updateTeam } from '@/lib/services/teamService';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

// GET /api/teams/[id]
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const team = await getTeamById(id);
        return jsonWithCors(team ?? {}, team ? 200 : 404);
    }
}

// PUT /api/teams/[id]
export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const body = await req.json();
        const updated = await updateTeam({ id, name: body.name });
        return jsonWithCors(updated);
    }
}

// DELETE /api/teams/[id]
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        await deleteTeam(id);
        return jsonWithCors({ message: 'Team deleted' });
    }
}
