import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:8081',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

// Handle GET
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const email = searchParams.get('email')

    if (!email) {
        return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    try {
        const user = await prisma.user.findFirst({
            where: { Email: email },
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const response = NextResponse.json(user)
        Object.entries(corsHeaders).forEach(([key, value]) =>
            response.headers.set(key, value)
        )
        return response
    } catch (err) {
        console.error('API error:', err)
        const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        Object.entries(corsHeaders).forEach(([key, value]) =>
            response.headers.set(key, value)
        )
        return response
    }
}
