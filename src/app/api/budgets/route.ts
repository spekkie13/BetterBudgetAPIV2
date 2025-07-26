import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import {
    getBudgetById,
    getBudgetByPeriodAndCategory,
    getBudgetsByCategoryId,
    getBudgetsByPeriodId,
    createBudget, getAllBudgets
} from '@/lib/services';
import { isValid } from '@/lib/helpers';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const userIdParam = searchParams.get('userId');
    if (!isValid(userIdParam)) return fail('User ID is required', 400);

    const userId = parseInt(userIdParam!);
    if (isNaN(userId)) return fail('User ID is invalid', 400);

    try {
        const budgetIdParam = searchParams.get('budgetId');
        const categoryIdParam = searchParams.get('categoryId');
        const periodIdParam = searchParams.get('periodId');

        if (isValid(categoryIdParam) && isValid(periodIdParam)) {
            const categoryId = parseInt(categoryIdParam!);
            const periodId = parseInt(periodIdParam!);
            if (isNaN(categoryId) || isNaN(periodId)) return fail('Invalid input', 400);

            const budget = await getBudgetByPeriodAndCategory(userId, periodId, categoryId);
            return ok(budget ?? {}, 'Budget fetched');
        }

        if (isValid(categoryIdParam)) {
            const categoryId = parseInt(categoryIdParam!);
            if (isNaN(categoryId)) return fail('Invalid categoryId', 400);

            const budgets = await getBudgetsByCategoryId(userId, categoryId);
            return ok(budgets, 'Budgets fetched by category');
        }

        if (isValid(periodIdParam)) {
            const periodId = parseInt(periodIdParam!);
            if (isNaN(periodId)) return fail('Invalid periodId', 400);

            const budgets = await getBudgetsByPeriodId(userId, periodId);
            return ok(budgets, 'Budgets fetched by period');
        }

        if (isValid(budgetIdParam)) {
            const budgetId = parseInt(budgetIdParam!);
            if (isNaN(budgetId)) return fail('Invalid budgetId', 400);

            const budget = await getBudgetById(userId, budgetId);
            return ok(budget ?? {}, 'Budget fetched by id');
        }

        const budgets = await getAllBudgets(userId)
        return ok(budgets,'Fetched all budgets');
    } catch (error: any) {
        console.error('Error fetching budgets:', error);
        return fail('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const created = await createBudget(body);
        return ok(created, 'Budget created', 201);
    } catch (error: any) {
        console.error('Error creating budget:', error);
        return fail('Failed to create budget', 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
