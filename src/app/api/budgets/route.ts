import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    getBudgetById,
    getBudgetByPeriodAndCategory,
    getBudgetsByCategoryId,
    getBudgetsByPeriodId,
    createBudget
} from '@/lib/services/budgetService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const budgetIdParam = searchParams.get('budgetId');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    if (!userIdParam) return jsonWithCors({ error: 'User ID is required' }, 400);

    const userId = parseInt(userIdParam);
    if (isNaN(userId)) return jsonWithCors({ error: 'User ID is invalid' }, 400);

    try {
        if (categoryIdParam && periodIdParam) {
            const categoryId = parseInt(categoryIdParam);
            const periodId = parseInt(periodIdParam);
            if (isNaN(categoryId) || isNaN(periodId)) return jsonWithCors({ error: 'Invalid input' }, 400);

            const budget = await getBudgetByPeriodAndCategory(userId, periodId, categoryId);
            return jsonWithCors(budget ?? {});
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const budgets = await getBudgetsByCategoryId(userId, categoryId);
            return jsonWithCors(budgets);
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const budgets = await getBudgetsByPeriodId(userId, periodId);
            return jsonWithCors(budgets);
        }

        if (budgetIdParam) {
            const budgetId = parseInt(budgetIdParam);
            if (isNaN(budgetId)) return jsonWithCors({ error: 'Invalid budgetId' }, 400);

            const budget = await getBudgetById(userId, budgetId);
            return jsonWithCors(budget ?? {});
        }

        return jsonWithCors({ error: 'Must provide budgetId, categoryId, or periodId' }, 400);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const created = await createBudget(body);
        return jsonWithCors(created, 201);
    } catch (error) {
        console.error('Error creating budget:', error);
        return jsonWithCors({ error: 'Failed to create budget' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
