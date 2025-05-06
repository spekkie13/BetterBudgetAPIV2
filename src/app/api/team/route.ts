import {NextResponse} from 'next/server'
import {findTeam} from "@/lib/services/teamService";
import {corsHeaders, jsonWithCors} from "@/lib/cors";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET (){
    try {
        const teams = await findTeam()

        return jsonWithCors(teams)
    } catch (err) {
        console.error('Error fetching team:', err)
        return jsonWithCors({error: 'Internal Server Error'}, 500)
    }
}
