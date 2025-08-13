// app/api/budgets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import {
    getBudgetById,
    getBudgetByMonthAndCategory,
    getBudgetsByCategory,
    getBudgetsByMonth,
    getAllBudgets,
    createBudget,
} from '@/lib/services/budgetService';
import { isValid } from '@/lib/helpers';

const isMonth = (s?: string | null) => !!s && /^\d{4}-\d{2}$/.test(s);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const teamIdParam = searchParams.get('teamId');
    if (!isValid(teamIdParam)) return fail('teamId is required', 400);

    const teamId = Number(teamIdParam);
    if (!Number.isInteger(teamId)) return fail('Invalid teamId', 400);

    try {
        const budgetIdParam = searchParams.get('budgetId');
        const categoryIdParam = searchParams.get('categoryId');
        const monthParam = searchParams.get('month'); // "YYYY-MM"

        // /api/budgets?teamId=1&categoryId=2&month=2025-08
        if (isValid(categoryIdParam) && isMonth(monthParam)) {
            const categoryId = Number(categoryIdParam);
            if (!Number.isInteger(categoryId)) return fail('Invalid categoryId', 400);

            const budget = await getBudgetByMonthAndCategory(teamId, monthParam!, categoryId);
            return ok(budget ?? {}, 'Budget fetched');
        }

        // /api/budgets?teamId=1&categoryId=2
        if (isValid(categoryIdParam)) {
            const categoryId = Number(categoryIdParam);
            if (!Number.isInteger(categoryId)) return fail('Invalid categoryId', 400);

            const rows = await getBudgetsByCategory(teamId, categoryId);
            return ok(rows, 'Budgets fetched by category');
        }

        // /api/budgets?teamId=1&month=2025-08
        if (isMonth(monthParam)) {
            const rows = await getBudgetsByMonth(teamId, monthParam!);
            return ok(rows, 'Budgets fetched by month');
        }

        // /api/budgets?teamId=1&budgetId=123
        if (isValid(budgetIdParam)) {
            const budgetId = Number(budgetIdParam);
            if (!Number.isInteger(budgetId)) return fail('Invalid budgetId', 400);

            const budget = await getBudgetById(teamId, budgetId);
            return ok(budget ?? {}, 'Budget fetched by id');
        }

        // /api/budgets?teamId=1
        const rows = await getAllBudgets(teamId);
        return ok(rows, 'Fetched all budgets');
    } catch (error) {
        console.error('Error fetching budgets:', error);
        return fail('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        /**
         * Body: {
         *   teamId: number,
         *   categoryId: number,
         *   month: "YYYY-MM",
         *   amount: number,         // major units
         *   rollover?: boolean
         * }
         */
        const body = await req.json();

        const teamId = Number(body?.teamId);
        const categoryId = Number(body?.categoryId);
        const month = String(body?.month ?? '');
        const amount = Number(body?.amount);
        const rollover = Boolean(body?.rollover ?? false);

        if (!Number.isInteger(teamId)) return fail('Invalid teamId', 400);
        if (!Number.isInteger(categoryId)) return fail('Invalid categoryId', 400);
        if (!/^\d{4}-\d{2}$/.test(month)) return fail('Invalid month (expected YYYY-MM)', 400);
        if (!Number.isFinite(amount)) return fail('Invalid amount', 400);

        const created = await createBudget({ teamId, categoryId, month, amount, rollover });
        return ok(created, 'Budget created', 201);
    } catch (error) {
        console.error('Error creating budget:', error);
        return fail('Failed to create budget', 400);
    }
}
