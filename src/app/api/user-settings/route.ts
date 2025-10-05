import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeUserSettingsController } from '@/adapters/controllers/userSettingsController';
import {UserSettingsService} from "@/adapters/services/userSettingsService";
import {UserSettingsBody, UserSettingsInsert, UserSettingsParams} from "@/db/types/userSettingsTypes";

const svc = new UserSettingsService();
const controller = makeUserSettingsController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId') ?? "";

    const result = await controller.getUserSetting(userId);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const upsert = UserSettingsBody.safeParse(body);
    if (!upsert.success) return { status: 400, body: { error: 'Invalid input' } };

    const userSettingBody: UserSettingsInsert = {
        userId: upsert.data.userId,
        theme: upsert.data.theme ?? "light",
        textSize: upsert.data.textSize ?? "medium",
        preferences: upsert.data.preferences ?? {},
    }

    const result = await controller.createUserSetting(userSettingBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { userId } = (ctx as { params: { userId: string } }).params;

    const params = UserSettingsParams.safeParse({ userId: userId });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid userId' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const parsed = UserSettingsBody.safeParse(body);
    if (!parsed.success) return new NextResponse(JSON.stringify({ error: 'invalid body' }), { status: 400, headers: corsHeaders });

    const result = await controller.updateUserSetting(Number(userId), body);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const userId = searchParams.get('userId') ?? "";

    const result = await controller.deleteUserSetting(userId);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
