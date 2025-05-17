import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { createTeam, getTeamById, getTeams } from '@/lib/services/teamService';

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

// GET /api/teams or /api/teams?teamId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('teamId');

    try {
        if (teamIdParam) {
            const teamId = parseInt(teamIdParam);
            if (isNaN(teamId)) return jsonWithCors({ error: 'Invalid teamId' }, 400);

            const team = await getTeamById(teamId);
            return jsonWithCors(team ?? {});
        }

        const allTeams = await getTeams();
        return jsonWithCors(allTeams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/teams
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!body.name) {
            return jsonWithCors({ error: 'Missing team name' }, 400);
        }

        const newTeam = await createTeam({ name: body.name });
        return jsonWithCors(newTeam, 201);
    } catch (error) {
        console.error('Error creating team:', error);
        return jsonWithCors({ error: 'Failed to create team' }, 400);
    }
}
