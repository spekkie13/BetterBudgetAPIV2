import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import {
    getResultById,
    getResultByCategoryAndPeriod,
    getResultsByCategory,
    getResultsByPeriod,
    createResult,
} from '@/lib/services/resultService';
import { ok, fail } from '@/lib/utils/apiResponse'
import {isValid} from "@/lib/helpers";

// GET /api/results?resultId=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    if (!isValid(userIdParam)) return fail('Invalid user id');

    try {
        const resultIdParam = searchParams.get('resultId');
        const categoryIdParam = searchParams.get('categoryId');
        const periodIdParam = searchParams.get('periodId');

        if (!isValid(resultIdParam) && !isValid(periodIdParam) && !isValid(categoryIdParam))
            return fail('Provide resultId, categoryId or periodId');

        const userId = parseInt(userIdParam);
        if (isNaN(userId)) return fail('Invalid user id');

        if (isValid(resultIdParam)) {
            const resultId = parseInt(resultIdParam!);
            if (isNaN(resultId)) return fail('Invalid resultId');

            const result = await getResultById(userId, resultId);
            return result ? ok(result) : fail('Could not find result', 404);
        }
        if (isValid(categoryIdParam) && isValid(periodIdParam)) {
            const categoryId = parseInt(categoryIdParam!);
            const periodId = parseInt(periodIdParam!);
            if (isNaN(categoryId) || isNaN(periodId)) return fail('Invalid category ID or invalid Period ID')

            const result = await getResultByCategoryAndPeriod(userId, categoryId, periodId);
            return result ? ok(result) : fail('Could not find result', 404);
        }
        if (isValid(categoryIdParam)) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return fail('Invalid category ID')

            const results = await getResultsByCategory(userId, categoryId);
            return results ? ok(results) : fail('Could not find results', 404);
        }
        if (isValid(periodIdParam)) {
            const periodId = parseInt(periodIdParam!);
            if (isNaN(periodId)) return fail('Invalid period id')

            const results = await getResultsByPeriod(userId, periodId);
            return results ? ok(results) : fail('Could not find results', 404);
        }
    } catch (error) {
        console.error('Error fetching results:', error);
        return fail('Internal server error', 500)
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

        return ok(newResult, 'Result created', 201);
    } catch (error) {
        console.error('Error creating result:', error);
        return fail('Internal server error', 500)
    }
}

// Handle OPTIONS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
