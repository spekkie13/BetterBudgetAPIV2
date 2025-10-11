import { NextRequest } from 'next/server';
import { makeCategoryController } from "@/adapters/controllers/categoryController";
import { CategoryService } from "@/adapters/services/categoryService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await controller.patchCategorySlots(body);
    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal Server Error');
}
