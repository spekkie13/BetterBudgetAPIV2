import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as periodService from '@/lib/services/periodService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'ID is required' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    const period = await periodService.getPeriodById(id);
    return jsonWithCors(period ?? {}, period ? 200 : 404);
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'ID is required' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    const body = await req.json();

    const updatedPeriod = await periodService.updatePeriod({
        id,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
    });

    return jsonWithCors(updatedPeriod);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'ID is required' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    await periodService.deletePeriodById(id);
    return jsonWithCors({ message: 'Period deleted' });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
