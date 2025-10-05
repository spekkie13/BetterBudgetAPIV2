import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody, UserParams } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/users/[id]
export async function GET(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const result = await controller.getUser(params.data.id);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const result = await controller.updateUser(parsed.data.id, parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

// DELETE /api/users/[id]
export async function DELETE(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteUser(params.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
