// File: /app/api/periods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as dateService from '@/lib/services/dateService';

// GET /api/periods or /api/periods?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const periodIdParam = searchParams.get('periodId');

    try {
        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await dateService.getExpensesGroupedByMonthYear();
            const single = period.find(p => p.id === periodId);
            return jsonWithCors(single ? [single] : []);
        }

        const allPeriods = await dateService.getExpensesGroupedByMonthYear();
        return jsonWithCors(allPeriods);
    } catch (error) {
        console.error('Error fetching periods:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/periods
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newPeriod = await dateService.createDate({
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });

        return jsonWithCors(newPeriod, 201);
    } catch (error) {
        console.error('Error creating period:', error);
        return jsonWithCors({ error: 'Failed to create period' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
