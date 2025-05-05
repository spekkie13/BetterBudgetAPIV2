import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCors } from '@/lib/cors'

export const GET = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const teamIdParam = searchParams.get('teamId')

    try {
        if(teamIdParam){
            const teamId = parseInt(teamIdParam)
            if(isNaN(teamId)){
                return NextResponse.json({ error: 'invalid teamId' }, {status: 400})
            }

            const users = await prisma.user.findMany({
                where: {
                    teamId: teamId
                }
            })
            return NextResponse.json(users)
        }

        const users = await prisma.user.findMany()
        return NextResponse.json(users)
    } catch (err) {
        console.error('Error fetching team:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})
