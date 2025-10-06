import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {makeCategoryController} from "@/adapters/controllers/categoryController";
import {CategoryService} from "@/adapters/services/categoryService";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const result = await controller.patchCategorySlots(body);
    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}
