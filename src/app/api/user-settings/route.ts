import { NextRequest } from 'next/server';
import { makeUserSettingsController } from '@/adapters/controllers/userSettingsController';
import { UserSettingsService } from "@/adapters/services/userSettingsService";
import { UserSettingsBody, UserSettingsInsert, UserSettingsParams } from "@/db/types/userSettingsTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new UserSettingsService();
const controller = makeUserSettingsController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId') ?? "";

    const result = await controller.getUserSetting(userId);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const upsert = UserSettingsBody.safeParse(body);
    if (!upsert.success)
        return fail(400, 'Invalid body');

    const userSettingBody: UserSettingsInsert = {
        userId: upsert.data.userId,
        theme: upsert.data.theme ?? "light",
        textSize: upsert.data.textSize ?? "medium",
        preferences: upsert.data.preferences ?? {},
    }

    const result = await controller.createUserSetting(userSettingBody);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx: any) {
    const { userId } = (ctx as { params: { userId: string } }).params;

    const params = UserSettingsParams.safeParse({ userId: userId });
    if (!params.success)
        return fail(400, 'Invalid user ID');

    const body = await req.json().catch(() => ({}));
    const parsed = UserSettingsBody.safeParse(body);
    if (!parsed.success)
        return fail(400, 'Invalid body');

    const result = await controller.updateUserSetting(Number(userId), body);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}

export async function DELETE(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId') ?? "";

    const parsed = UserSettingsParams.safeParse({ userId: userId.toString()});
    if (!parsed.success)
        return fail(400, 'Invalid user ID');

    const result = await controller.deleteUserSetting(parsed.data.userId);
    return isRequestSuccessful(result.status) ?
        ok(JSON.stringify(result.data)) :
        fail(500, 'Internal server error...');
}
