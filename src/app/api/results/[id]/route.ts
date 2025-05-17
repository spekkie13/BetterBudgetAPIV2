// File: /app/api/results/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as periodResultService from '@/lib/services/resultService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        const results = await periodResultService.findPeriodResultsByFilter({ id });
        return jsonWithCors(results.length > 0 ? results[0] : {}, results.length > 0 ? 200 : 404);
    }
}

export async function PUT(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);
        const body = await req.json();

        const updated = await periodResultService.updatePeriodResult({
            id,
            ...body,
        });

        return jsonWithCors(updated);

    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

        await periodResultService.deletePeriodResults(id);
        return jsonWithCors({ message: 'Period result deleted' });
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
