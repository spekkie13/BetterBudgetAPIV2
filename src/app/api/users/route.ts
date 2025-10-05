import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody, UserQuery } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/users?userId=&teamId=&email=
export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = UserQuery.safeParse({
        userId: sp.get('userId') ?? undefined,
        teamId: sp.get('teamId') ?? undefined,
        email: sp.get('email') ?? undefined,
    });
    if (!parsed.success) {
        return new NextResponse(JSON.stringify({ error: 'Invalid query' }), { status: 400, headers: corsHeaders });
    }

    let result;
    if (parsed.data.id !== undefined){
        result = await controller.getUser(parsed.data.id);
        return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
    }

    if (parsed.data.email !== undefined){
        result = await controller.getUserByEmail(parsed.data.email);
        return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
    }

    if (parsed.data.teamId !== undefined){
        result = await controller.getUserByTeamId(parsed.data.teamId);
        return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
    }
}

// POST /api/users
export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success) {
        return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });
    }

    const result = await controller.createUser(parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
