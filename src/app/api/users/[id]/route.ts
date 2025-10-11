import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody, UserParams } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS() {
    return ok(null, '', 204)
}

// GET /api/users/[id]
export async function GET(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(400, 'Invalid user ID');

    const result = await controller.getUser(params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}

// PUT /api/users/[id]
export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(400, 'Invalid user ID');

    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(400, 'Invalid body');

    const result = await controller.updateUser(parsed.data.id, parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}

// DELETE /api/users/[id]
export async function DELETE(_req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(400, 'Invalid user ID');

    const result = await controller.deleteUser(params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data), '', 204) :
        fail(500, 'Internal server error...');
}
