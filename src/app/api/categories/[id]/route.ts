import { NextRequest, NextResponse } from 'next/server';
import {fail, ok} from '@/lib/utils/apiResponse'
import { corsHeaders } from '@/lib/cors';
import * as categoryService from '@/lib/services/categoryService';
import {isValid} from "@/lib/helpers";

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!isValid(idParam)) return fail('Must provide a valid id', 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return fail( 'Invalid ID', 400)

    const body = await req.json();
    const updated = await categoryService.updateCategory({ ...body, id });

    return ok(updated);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const teamIdParam = searchParams.get('teamId');

    if (!isValid(idParam)) return fail('Must provide a valid id', 400);
    if (!isValid(teamIdParam)) return fail('Must provide a valid id', 400);

    const id = parseInt(idParam);
    const teamId = parseInt(teamIdParam);
    if (isNaN(id)) return fail('Invalid ID', 400)
    if (isNaN(teamId)) return fail('Invalid ID', 400)

    await categoryService.deleteCategoryById(id, teamId);
    return ok({}, 'Category deleted successfully', 201);
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
