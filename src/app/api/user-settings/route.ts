import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import {
    getUserSettingsController,
    postUserSettingsController,
    putUserSettingsController,
    patchUserSettingsController,
    deleteUserSettingsController,
} from '@/lib/http/userSettings/userSettingsController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const result = await getUserSettingsController(new URL(req.url).searchParams);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await postUserSettingsController(body);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await putUserSettingsController(body);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await patchUserSettingsController(body);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(req: NextRequest) {
    const result = await deleteUserSettingsController(new URL(req.url).searchParams);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}
