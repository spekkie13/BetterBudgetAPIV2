// File: /app/api/teams/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {createTeam, findTeam, getTeams} from "@/lib/services/teamService";

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

// GET /api/teams or /api/teams?teamId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('teamId');

    try {
        if (teamIdParam) {
            const teamId = parseInt(teamIdParam);
            if (isNaN(teamId)) return jsonWithCors({ error: 'Invalid teamId' }, 400);

            const team = await findTeam(teamId)
            return jsonWithCors(team ? team : {});
        }

        const allTeams = await getTeams()
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
        const newTeam = await createTeam(body)

        return jsonWithCors(newTeam, 201);
    } catch (error) {
        console.error('Error creating team:', error);
        return jsonWithCors({ error: 'Failed to create team' }, 400);
    }
}
