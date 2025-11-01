import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {User} from "@/models/user";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam = await getUserByToken(req.headers.get('authorization'));
    const user: User = userWithTeam.user;

    const result = await controller.getUser(user.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest) {
    const userWithTeam: UserWithTeam = await getUserByToken(req.headers.get('authorization'));
    const user: User = userWithTeam.user;

    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');

    const result = await controller.updateUser(user.id, parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest) {
    const userWithTeam: UserWithTeam = await getUserByToken(req.headers.get('authorization'));
    const user: User = userWithTeam.user;

    const result = await controller.deleteUser(user.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data, '', 204) :
        fail(req, 500, 'Internal server error...');
}
