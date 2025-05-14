// File: /app/api/users/route.ts
import {NextRequest, NextResponse} from 'next/server';
import { prisma } from '@/lib/prisma';
import {corsHeaders, jsonWithCors} from "@/lib/cors";

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

// GET /api/users?userId=... or ?teamId=... or none (all users)
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const teamIdParam = searchParams.get('teamId');

    try {
        if (userIdParam) {
            const userId = parseInt(userIdParam);
            if (isNaN(userId)) return jsonWithCors({ error: 'Invalid userId' }, 400);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { team: true },
            });

            return jsonWithCors(user ? user : {});
        }

        if (teamIdParam) {
            const teamId = parseInt(teamIdParam);
            if (isNaN(teamId)) return jsonWithCors({ error: 'Invalid teamId' }, 400);

            const users = await prisma.user.findMany({
                where: { teamId },
                include: { team: true },
            });

            return jsonWithCors(users);
        }

        const allUsers = await prisma.user.findMany({
            include: { team: true },
        });

        return jsonWithCors(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/users
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newUser = await prisma.user.create({
            data: {
                email: body.email,
                username: body.username,
                name: body.name,
                teamId: body.teamId || null,
            },
        });

        return jsonWithCors(newUser, 201);
    } catch (error) {
        console.error('Error creating user:', error);
        return jsonWithCors({ error: 'Failed to create user' }, 400);
    }
}
