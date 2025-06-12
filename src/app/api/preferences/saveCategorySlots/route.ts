import { NextRequest, NextResponse } from 'next/server';
import {corsHeaders} from "@/lib/cors";
import {saveCategorySlots} from "@/lib/services/preferenceService"; // your drizzle logic

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, preferences } = body;

        await saveCategorySlots(userId, preferences);

        return NextResponse.json(JSON.stringify({ success: true }), {
            status: 200,
            headers: corsHeaders
        });
    } catch (error) {
        console.error('Failed to save category slots:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
