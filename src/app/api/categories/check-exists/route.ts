import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { makeCategoryController } from '@/adapters/controllers/categoryController';
import {CategoryService} from "@/adapters/services/categoryService";
import {CategoryParams} from "@/db/types/categoryTypes";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function POST(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = CategoryParams.safeParse({ teamId: teamId, id: id });
    if (!params.success || params.data.id === null || params.data.id === undefined)
        return new NextResponse(JSON.stringify({ error: 'invalid params'}), { status: 400, headers: corsHeaders})

    const result = await controller.ensureAllExists(params.data.teamId, [params.data.id]);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders})
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
