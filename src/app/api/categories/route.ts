import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {CategoryService} from "@/adapters/services/categoryService";
import {makeCategoryController} from "@/adapters/controllers/categoryController";
import {CategoryBody, CategoryInsert, CategoryParams, CategoryQuery} from "@/db/types/categoryTypes";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const teamId = searchParams.get("teamId");
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    const parsedParams = CategoryParams.safeParse({ teamId });
    if (!parsedParams.success) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid teamId' }),
            { status: 400, headers: corsHeaders}
        )
    }

    const parsedQuery = CategoryQuery.safeParse({teamId, id, type});
    if (!parsedQuery.success){
        return new NextResponse(
            JSON.stringify({ error: 'Invalid Query'}),
            { status: 400, headers: corsHeaders}
        )
    }

    const result = await controller.getCategory(parsedQuery.data.teamId, parsedQuery.data.id)
    return new NextResponse(JSON.stringify(result.body), {
        status: result.status,
        headers: corsHeaders
    })
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = CategoryParams.safeParse({ teamId: teamId, id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid params'}), { status: 400, headers: corsHeaders});

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success) return new NextResponse(JSON.stringify({ error: 'Invalid body'}), { status: 400, headers: corsHeaders});

    const categoryBody: CategoryInsert = {
        id: params.data.id,
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };

    const result = await controller.updateCategory(params.data.teamId, params.data.id, categoryBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; } }).params;

    const params = CategoryParams.safeParse({ teamId: teamId })
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId '}), { status: 400, headers: corsHeaders })

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success) return new NextResponse(JSON.stringify({ error: 'invalid body' }), { status: 400, headers: corsHeaders})

    const categoryBody: CategoryInsert = {
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };

    const result = await controller.createCategory(params.data.teamId, categoryBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;
    const params = CategoryParams.safeParse({ teamId: teamId, id: id });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid params'}), { status: 400, headers: corsHeaders})

    const result = await controller.deleteCategory(params.data.teamId, params.data.id);
    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
