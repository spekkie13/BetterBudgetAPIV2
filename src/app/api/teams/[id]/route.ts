import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { deleteTeam, getTeamById, updateTeam } from '@/lib/services/teamService';
import { ok, fail } from '@/lib/utils/apiResponse';

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
        if (isNaN(id)) return fail('Invalid ID')

        const team = await getTeamById(id);
        return team ? ok(team) : fail('Could not find a team with id ' + id, 404);
    }
    return fail('Provide a valid ID', 500)
}

// PUT /api/teams/[id]
export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return fail('Invalid ID')

        const body = await req.json();
        const updated = await updateTeam({ id, name: body.name });
        return ok(updated, 'Updated team', 201)
    }
    else {
        return fail('Provide a valid ID', 500)
    }
}

// DELETE /api/teams/[id]
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return fail('Invalid ID')

        await deleteTeam(id);
        return ok({}, 'Team deleted', 201)
    }
    return fail('Provide a valid ID', 500)
}
