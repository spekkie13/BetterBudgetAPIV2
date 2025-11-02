import { NextRequest } from 'next/server';
import { makeUserSettingsController } from '@/adapters/controllers/userSettingsController';
import { UserSettingsService } from "@/adapters/services/userSettingsService";
import { UserSettingsBody, UserSettingsInsert, UserSettingsParams } from "@/db/types/userSettingsTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import {User, UserWithTeam} from "@/models";
import {getUserByToken} from "@/core/http/requestHelpers";

const svc = new UserSettingsService();
const controller = makeUserSettingsController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const user: User = userWithTeam.user;

    const result = await controller.getUserSetting(user.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const upsert = UserSettingsBody.safeParse(body);
    if (!upsert.success)
        return fail(req, 400, 'Invalid body');

    const userSettingBody: UserSettingsInsert = {
        userId: upsert.data.userId,
        theme: upsert.data.theme ?? "light",
        textSize: upsert.data.textSize ?? "medium",
        preferences: upsert.data.preferences ?? {},
    }

    const result = await controller.createUserSetting(userSettingBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx: any) {
    const { userId } = (ctx as { params: { userId: string } }).params;

    const params = UserSettingsParams.safeParse({ userId: userId });
    if (!params.success)
        return fail(req, 400, 'Invalid user ID');

    const body = await req.json().catch(() => ({}));
    const parsed = UserSettingsBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Invalid body');

    const result = await controller.updateUserSetting(Number(userId), body);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId') ?? "";

    const parsed = UserSettingsParams.safeParse({ userId: userId.toString()});
    if (!parsed.success)
        return fail(req, 400, 'Invalid user ID');

    const result = await controller.deleteUserSetting(parsed.data.userId);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}
