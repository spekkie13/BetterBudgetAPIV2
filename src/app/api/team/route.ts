import {NextResponse} from 'next/server'
import { prisma } from '@/lib/prisma'
import {withCors} from "@/lib/cors";

export const GET = withCors(async () => {
    try {
        const teams = await prisma.team.findMany()

        return NextResponse.json(teams)
    } catch (err) {
        console.error('Error fetching team:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})
