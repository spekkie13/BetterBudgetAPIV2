import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import { getUserByToken } from "@/core/http/requestHelpers";
import {User} from "@/models/user";
import {UserWithTeam} from "@/models/userWithTeams";
import {Team} from "@/models/team";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam = await getUserByToken(req.headers.get('authorization'));
    const user: User = userWithTeam.user
    const team: Team = userWithTeam.team;

    if (User.isEmpty(user)) {
        return fail(req, 401, 'Invalid authorization');
    }

    let result;
    if (user.id !== 0){
        result = await controller.getUser(user.id);
        return isRequestSuccessful(result.status) ?
            ok(req, result.data) :
            fail(req, 400, 'Invalid query');
    }

    if (user.email !== undefined){
        result = await controller.getUserByEmail(user.email);
        return isRequestSuccessful(result.status)
            ? ok(req, result.data)
            : fail(req, 400, 'Invalid query');
    }

    if (team.id !== 0){
        result = await controller.getUserByTeamId(team.id);
        return isRequestSuccessful(result.status) ?
            ok(req, result.data) :
            fail(req, 400, 'Invalid query');
    }
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
