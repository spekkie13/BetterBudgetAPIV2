// File: /app/api/periodresults/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as periodResultService from '@/lib/services/recentperiodresultService';

// GET /api/periodresults?resultId=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const resultIdParam = searchParams.get('resultId');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (resultIdParam) {
            const resultId = parseInt(resultIdParam);
            if (isNaN(resultId)) return jsonWithCors({ error: 'Invalid resultId' }, 400);

            const results = await periodResultService.findPeriodResultsByFilter({ id: resultId });
            return jsonWithCors(results);
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const results = await periodResultService.findPeriodResultsByFilter({ categoryId });
            return jsonWithCors(results);
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const results = await periodResultService.findPeriodResultsByFilter({ periodId });
            return jsonWithCors(results);
        }

        return jsonWithCors({ error: 'Must provide resultId, categoryId, or periodId' }, 400);
    } catch (error) {
        console.error('Error fetching period results:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/periodresults
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newResult = await periodResultService.createNewPeriodResult({
            totalSpent: body.totalSpent,
            percentageSpent: body.percentageSpent,
            userId: body.userId,
            categoryId: body.categoryId,
            periodId: body.periodId,
        });

        return jsonWithCors(newResult, 201);
    } catch (error) {
        console.error('Error creating period result:', error);
        return jsonWithCors({ error: 'Failed to create period result' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
