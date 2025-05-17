// File: /app/api/results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    createNewPeriodResult,
    getResultByCategoryAndPeriod,
    getResultById,
    getResultsByCategory, getResultsByPeriod
} from "@/lib/services/resultService";

// GET /api/results?resultId=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const resultIdParam = searchParams.get('resultId');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');
    const userIdParam = searchParams.get('userId');

    try {
        if(!userIdParam){
            return jsonWithCors({ error: 'User ID is required'}, 400)
        }
        const userId = parseInt(userIdParam);
        if(isNaN(userId)){
            return jsonWithCors({ error: 'User ID is invalid'}, 400)
        }

        if (resultIdParam) {
            const resultId = parseInt(resultIdParam);
            if(isNaN(resultId)){
                return jsonWithCors({ error: 'Result ID is invalid'}, 400)
            }
            const result = await getResultById(resultId);
            if(!result){
                return jsonWithCors({ error: 'Could not find result for the specified ID'}, 404)
            }

            return jsonWithCors(result)
        }

        if (categoryIdParam && periodIdParam){
            const periodId = parseInt(periodIdParam);
            const categoryId = parseInt(categoryIdParam);
            if(isNaN(periodId) || isNaN(categoryId)){
                return jsonWithCors({ error: 'invalid input'}, 400)
            }

            const result = await getResultByCategoryAndPeriod(categoryId, periodId);
            if(!result){
                jsonWithCors({error: 'Could not find a result for the specified input'}, 404)
            }

            return jsonWithCors(result)
        }

        if (categoryIdParam){
            const categoryId = parseInt(categoryIdParam);
            if(isNaN(categoryId)){
                return jsonWithCors({ error: 'invalid category ID'}, 400)
            }

            const results = await getResultsByCategory(categoryId);
            if(!results){
                return jsonWithCors({error: 'Could not find results for the specified category'}, 404)
            }

            return jsonWithCors(results)
        }

        if (periodIdParam){
            const periodId = parseInt(periodIdParam);
            if(isNaN(periodId)){
                return jsonWithCors({ error: 'invalid input'}, 400)
            }

            const results = await getResultsByPeriod(periodId);
            if(!results){
                return jsonWithCors({error: 'Could not find results for the specified period'}, 404)
            }

            return jsonWithCors(results)
        }
    } catch (error) {
        console.error('Error fetching period results:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/results
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newResult = await createNewPeriodResult({
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
