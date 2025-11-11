import { NextRequest } from 'next/server';
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken} from "@/core/http/ApiHelpers";
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { UserWithTeam, User } from "@/models";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const user: User = userWithTeam.user;

    const result = await controller.getUser(user.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function PUT(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const user: User = userWithTeam.user;

    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');

    const result = await controller.updateUser(user.id, parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function DELETE(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const user: User = userWithTeam.user;

    const result = await controller.deleteUser(user.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data, '', 204) :
        fail(req, result.status, result.error);
}
