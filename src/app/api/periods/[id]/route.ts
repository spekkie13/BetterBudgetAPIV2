import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import * as periodService from '@/lib/services/periodService';
import {isValid} from "@/lib/helpers";
import { ok, fail } from "@/lib/utils/apiResponse";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!isValid(idParam)) return fail('Invalid id param');

    const id = parseInt(idParam!);
    if (isNaN(id)) return fail('Invalid ID');

    const period = await periodService.getPeriodById(id);
    return period ? ok(period) : fail('No period found', 404);
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!isValid(idParam)) return fail('Invalid id param');

    const id = parseInt(idParam);
    if (isNaN(id)) return fail('Invalid ID');

    const body = await req.json();

    const updatedPeriod = await periodService.updatePeriod({
        id,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
    });

    return ok(updatedPeriod, 'Successfully created period', 201);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!isValid(idParam)) return fail('ID is required');

    const id = parseInt(idParam);
    if (isNaN(id)) return fail('Invalid ID');

    await periodService.deletePeriodById(id);
    return ok({}, 'Period successfully deleted', 201);
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
