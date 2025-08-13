import {corsHeaders} from '@/lib/cors';
import {NextRequest, NextResponse} from 'next/server';
import {deleteUserById, getUserByEmail, getUserById, updateUser} from "@/lib/services/userService";
import { ok, fail } from '@/lib/utils/apiResponse'

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const email = searchParams.get('email');

    if(userIdParam) {
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            console.log('invalid user ID')
            return fail('Provide a valid user ID')
        }
        const user = await getUserById(userId)
        return user ? ok(user) : fail('user not found', 404)
    }

    if(email){
        const user = await getUserByEmail(email);
        return user ? ok(user) : fail('user not found', 404);
    }

    console.log('No user ID or email provided')
    return fail('User ID or email is required', 400)
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        const body = await req.json();

        const updatedUser = await updateUser({
            id,
            ...body
        });
        return ok(updatedUser);
    }
    return fail('User ID is required', 400);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        await deleteUserById(id)
        return ok({}, 'User deleted')
    }
    return fail('User ID is required', 400);
}
