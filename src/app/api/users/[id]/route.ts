// File: /app/api/users/[id]/route.ts
import { prisma } from '@/lib/prisma';
import {corsHeaders, jsonWithCors} from '@/lib/cors';
import {NextRequest, NextResponse} from 'next/server';
import {getUserByEmail, getUserById} from "@/lib/services/userService";

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
        if (isNaN(userId)) return jsonWithCors({ error: 'invalid UserID'}, 400)
        const user = await getUserById(userId)
        return jsonWithCors(user || {}, user ? 200 : 404);
    }

    if(email){
        const user = await getUserByEmail(email);
        return jsonWithCors(user || {}, user ? 200 : 404)
    }

}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        const body = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id },
            data: body,
        });

        return jsonWithCors(updatedUser);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        await prisma.user.delete({ where: { id } });
        return jsonWithCors({ message: 'User deleted' });
    }
}
