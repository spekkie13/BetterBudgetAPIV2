import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { UserIdParams, UpdateUserBody } from '@/lib/http/users/userSchemas';
import { getUserByIdController, updateUserController, deleteUserController } from '@/lib/http/users/userController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/users/[id]
export async function GET(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserIdParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const result = await getUserByIdController(params.data);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserIdParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const parsed = UpdateUserBody.safeParse(body);
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const result = await updateUserController(params.data, parsed.data);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

// DELETE /api/users/[id]
export async function DELETE(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserIdParams.safeParse({ id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid user ID' }), { status: 400, headers: corsHeaders });

    const result = await deleteUserController(params.data);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
