import { NextRequest } from 'next/server';
import { CategoryService } from "@/adapters/services/categoryService";
import { makeCategoryController } from "@/adapters/controllers/categoryController";
import { CategoryBody, CategoryInsert, CategoryParams, CategoryQuery } from "@/db/types/categoryTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const teamId = searchParams.get("teamId");
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    const parsedParams = CategoryParams.safeParse({ teamId });
    if (!parsedParams.success) return fail(req, 400, 'Invalid TeamId')

    const parsedQuery = CategoryQuery.safeParse({
        teamId: teamId,
        id: id,
        type: type
    });

    if (!parsedQuery.success)
        return fail(req, 400, 'Invalid Params')

    const result = await controller.getCategory(parsedQuery.data.teamId, parsedQuery.data.id)
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const teamId = sp.get("teamId");
    const id = sp.get("id");
    // const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = CategoryParams.safeParse({ id: id, teamId: teamId });
    if (!params.success)
        return fail(req, 400, 'Invalid Params')

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid Body')

    const categoryBody: CategoryInsert = {
        id: params.data.id,
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };
    console.log(categoryBody);
    const result = await controller.updateCategory(params.data.teamId, params.data.id ?? 0, categoryBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; } }).params;

    const params = CategoryParams.safeParse({ teamId: teamId })
    if (!params.success)
        return fail(req, 400, 'Invalid teamId')

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body')

    const categoryBody: CategoryInsert = {
        teamId: params.data.teamId,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };

    const result = await controller.createCategory(params.data.teamId, categoryBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;
    const params = CategoryParams.safeParse({ teamId: teamId, id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid params');
    if (params.data.id === undefined)
        return fail(req, 400, 'Invalid Id');

    const result = await controller.deleteCategory(params.data.teamId, params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
