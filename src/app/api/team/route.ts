import {NextRequest, NextResponse} from 'next/server'
import {findTeam} from "@/lib/services/teamService";
import {corsHeaders, jsonWithCors} from "@/lib/cors";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET (req: NextRequest){
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('teamId');

    if(!teamId){
        return jsonWithCors({ error: 'Missing teamId' }, 400)
    }

    try {
        const team = await findTeam(teamId)

        if(!team){
            return jsonWithCors({ error: 'Missing teamId' }, 400)
        }

        return jsonWithCors(team)
    } catch (err) {
        console.error('Error fetching team:', err)
        return jsonWithCors({error: 'Internal Server Error'}, 500)
    }
}
