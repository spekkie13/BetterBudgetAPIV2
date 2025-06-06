import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    getResultById,
    getResultByCategoryAndPeriod,
    getResultsByCategory,
    getResultsByPeriod,
    createResult
} from '@/lib/services/resultService';

// GET /api/results?resultId=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const resultIdParam = searchParams.get('resultId');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');
    const userIdParam = searchParams.get('userId');

    try {
        if (!userIdParam) {
            return jsonWithCors({ error: 'User ID is required' }, 400);
        }

        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            return jsonWithCors({ error: 'User ID is invalid' }, 400);
        }

        if (resultIdParam) {
            const resultId = parseInt(resultIdParam);
            if (isNaN(resultId)) return jsonWithCors({ error: 'Invalid resultId' }, 400);

            const result = await getResultById(userId, resultId);
            return jsonWithCors(result ?? {}, result ? 200 : 404);
        }

        if (categoryIdParam && periodIdParam) {
            const categoryId = parseInt(categoryIdParam);
            const periodId = parseInt(periodIdParam);
            if (isNaN(categoryId) || isNaN(periodId)) {
                return jsonWithCors({ error: 'Invalid categoryId or periodId' }, 400);
            }

            const result = await getResultByCategoryAndPeriod(userId, categoryId, periodId);
            return jsonWithCors(result ?? {}, result ? 200 : 404);
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const results = await getResultsByCategory(userId, categoryId);
            return jsonWithCors(results);
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const results = await getResultsByPeriod(userId, periodId);
            return jsonWithCors(results);
        }

        return jsonWithCors({ error: 'Provide resultId, categoryId or periodId' }, 400);
    } catch (error) {
        console.error('Error fetching results:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/results
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newResult = await createResult({
            totalSpent: body.totalSpent,
            percentageSpent: body.percentageSpent,
            userId: body.userId,
            categoryId: body.categoryId,
            periodId: body.periodId,
        });

        return jsonWithCors(newResult, 201);
    } catch (error) {
        console.error('Error creating result:', error);
        return jsonWithCors({ error: 'Failed to create result' }, 400);
    }
}

// Handle OPTIONS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
