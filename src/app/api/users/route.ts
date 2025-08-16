import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { UsersQuery, CreateUserBody } from '@/lib/http/users/userSchemas';
import { listOrFilterUsersController, createUserController } from '@/lib/http/users/userController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/users?userId=&teamId=&email=
export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = UsersQuery.safeParse({
        userId: sp.get('userId') ?? undefined,
        teamId: sp.get('teamId') ?? undefined,
        email: sp.get('email') ?? undefined,
    });
    if (!parsed.success) {
        return new NextResponse(JSON.stringify({ error: 'Invalid query' }), { status: 400, headers: corsHeaders });
    }

    const result = await listOrFilterUsersController(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

// POST /api/users
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = CreateUserBody.safeParse(body);
    if (!parsed.success) {
        return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });
    }

    const result = await createUserController(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
