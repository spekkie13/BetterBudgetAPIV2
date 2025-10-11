import { NextRequest } from 'next/server';
import { makeUserController } from '@/adapters/controllers/userController';
import { UserBody, UserQuery } from "@/db/types/userTypes";
import { UserService } from "@/adapters/services/userService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new UserService();
const controller = makeUserController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = UserQuery.safeParse({
        userId: sp.get('userId') ?? 0,
        teamId: sp.get('teamId') ?? 0,
        email: sp.get('email') ?? "",
    });
    if (!parsed.success) {
        return fail(req, 400, 'Invalid query')
    }

    let result;
    if (parsed.data.userId !== 0){
        result = await controller.getUser(parsed.data.userId);
        return isRequestSuccessful(result.status) ?
            ok(req, result.data) :
            fail(req, 400, 'Invalid query');
    }

    if (parsed.data.email !== undefined){
        result = await controller.getUserByEmail(parsed.data.email);
        return isRequestSuccessful(result.status)
            ? ok(req, result.data)
            : fail(req, 400, 'Invalid query');
    }

    if (parsed.data.teamId !== 0){
        result = await controller.getUserByTeamId(parsed.data.teamId);
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
