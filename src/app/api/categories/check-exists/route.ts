import { NextRequest } from 'next/server';
import { makeCategoryController } from '@/adapters/controllers/categoryController';
import { CategoryService } from "@/adapters/services/categoryService";
import { CategoryParams } from "@/db/types/categoryTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function POST(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = CategoryParams.safeParse({ teamId: teamId, id: id });
    if (!params.success || params.data.id === null || params.data.id === undefined)
        return fail(400, 'Invalid Params');

    const result = await controller.ensureAllExists(params.data.teamId, [params.data.id]);
    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
