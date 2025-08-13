// File: /app/api/users/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders} from "@/lib/cors";
import {createUser, getUserByEmail, getUserById, getUsers, getUsersByTeamId} from "@/lib/services/userService";
import { isValid } from '@/lib/helpers'
import { ok, fail } from '@/lib/utils/apiResponse'

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
    const email = searchParams.get('email');

    try {
        if (userIdParam && !isNaN(parseInt(userIdParam))) {
            const userId = parseInt(userIdParam!);
            const user = await getUserById(userId);
            return user ? ok(user) : fail('No user with id ' + userId);
        }
        if (teamIdParam && !isNaN(parseInt(teamIdParam))) {
            const teamId = parseInt(teamIdParam!);
            const users = await getUsersByTeamId(teamId);
            return users ? ok(users) : fail('No users found in team ', teamId);
        }
        if (email && isValid(email)) {
            const user = await getUserByEmail(email);
            return user ? ok(user) : fail('No user with email ' + email);
        }

        const allUsers = await getUsers()
        return allUsers ? ok(allUsers) : fail('No users found')
    } catch (error) {
        console.error('Error fetching users:', error);
        return fail('Internal server error', 500)
    }
}

// POST /api/users
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newUser = await createUser({
            email: body.email,
            username: body.username,
            name: body.name,
        })

        return ok(newUser, 'New user created successfully', 201)
    } catch (error) {
        console.error('Error creating user:', error);
        return fail('Internal server error', 500)
    }
}
