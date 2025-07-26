import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { createTeam, getTeamById, getTeams } from '@/lib/services/teamService';
import { ok, fail } from '@/lib/utils/apiResponse'
import { isValid } from '@/lib/helpers'

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
            if (!isValid(teamIdParam)) return fail('Invalid team id');
            const teamId = parseInt(teamIdParam!);
            if (isNaN(teamId)) return fail('Invalid teamId');

            const team = await getTeamById(teamId);
            return team ? ok(team) : fail('No team found', 404);
        }

        const allTeams = await getTeams();
        return ok(allTeams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        return fail('Internal Server Error', 500);
    }
}

// POST /api/teams
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!isValid(body.name)) return fail('Missing team name')

        const newTeam = await createTeam({ name: body.name });
        ok(newTeam, 'Successfully created new team', 201);
    } catch (error) {
        console.error('Error creating team:', error);
        return fail('Failed to create team')
    }
}
