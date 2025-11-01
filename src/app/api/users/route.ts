import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import {User} from "@/models/user";
import {Team} from "@/models/team";
import {UserWithTeam} from "@/models/userWithTeams";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const email = new URL(req.url).searchParams.get('email');

    if (email === null)
        return fail(req, 400, 'Email address is required');

    const userData = await controller.getUserByEmail(email);

    const user: User = User.create(userData.data);
    const team: Team = Team.create(userData.data?.teams);
    const userWithTeam = new UserWithTeam(user, team);

    if (userWithTeam)
        return ok(req, userWithTeam);
    else
        return fail(req, 400, 'Invalid query');
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = UserBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');


    const result = await controller.createUser(parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}
