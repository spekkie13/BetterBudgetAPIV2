import {NextResponse} from 'next/server'
import {findTeam} from "@/lib/services/teamService";

export async function GET (){
    try {
        const teams = await findTeam()

        return NextResponse.json(teams)
    } catch (err) {
        console.error('Error fetching team:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
