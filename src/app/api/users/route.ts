import { NextRequest } from 'next/server';
import {ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken} from "@/core/http/ApiHelpers";
import { makeUserController } from '@/adapters/controllers/userController';
import { User, Team, UserWithTeam } from "@/models";
import { UserBody } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userData: UserWithTeam | null = await getUserDataByToken(req);
    if (!userData)
        return fail(req, 401, 'Invalid token');

    const user: User = userData.user;
    const team: Team = userData.team;
    const userWithTeam = new UserWithTeam(user, team);

    if (userWithTeam)
        return ok(req, userWithTeam);
    else
        fail(req, 404, 'User not found');
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');

    const result = await controller.createUser(parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}
