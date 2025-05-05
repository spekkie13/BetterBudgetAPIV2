import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const teams = await prisma.team.findMany()

        return NextResponse.json(teams)
    } catch (err) {
        console.error('Error fetching team:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
