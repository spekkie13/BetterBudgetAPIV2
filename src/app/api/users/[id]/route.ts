import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody, UserParams } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid user ID');

    const result = await controller.getUser(params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid user ID');

    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');

    const result = await controller.updateUser(parsed.data.id, parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = UserParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid user ID');

    const result = await controller.deleteUser(params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data, '', 204) :
        fail(req, 500, 'Internal server error...');
}
