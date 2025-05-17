// File: /app/api/periods/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as dateService from '@/lib/services/periodService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const periods = await dateService.getExpensesGroupedByMonthYear();
        const period = periods.find(p => p.id === id);
        return jsonWithCors(period || {}, period ? 200 : 404);
    }
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        const body = await req.json();

        const updatedPeriod = await dateService.updateDate({
            id,
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });

        return jsonWithCors(updatedPeriod);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);
        await dateService.deleteDateById(id);
        return jsonWithCors({ message: 'Period deleted' });
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
