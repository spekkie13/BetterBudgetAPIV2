// File: /app/api/periods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { createDate, getPeriodByExpenseDate, getPeriodById } from "@/lib/services/periodService";
import {getDistinctExpensePeriods, getMostRecentExpense} from "@/lib/services/expenseService";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const periodIdParam = searchParams.get('periodId');
    const categoryIdParam = searchParams.get('categoryId');

    const userId = userIdParam ? parseInt(userIdParam) : NaN;
    if (isNaN(userId)) {
        return jsonWithCors({ error: 'userId is required and must be a number' }, 400);
    }

    try {
        // ✅ 1. Get specific period by ID
        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await getPeriodById(periodId);
            return jsonWithCors(period ?? {});
        }

        // ✅ 2. Get most recent period for category + user
        if (categoryIdParam && req.url.includes('/recent')) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const latestExpense = await getMostRecentExpense(userId, categoryId);
            console.log(latestExpense);
            if (!latestExpense) {
                return jsonWithCors({ error: 'No expenses found for this user and category' }, 404);
            }

            const period = await getPeriodByExpenseDate(latestExpense.date);
            return jsonWithCors(period ?? {});
        }

        // ✅ 3. Get all periods for user & category with expenses
        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const expenses = await getDistinctExpensePeriods(userId, categoryId);

            const seen = new Set<number>();
            const periods: any[] = [];

            for (const { date } of expenses) {
                const period = await getPeriodByExpenseDate(date);

                if (period && !seen.has(period.id)) {
                    seen.add(period.id);
                    periods.push(period);
                }
            }

            return jsonWithCors(periods);
        }

        return jsonWithCors({ error: 'Must provide periodId or categoryId' }, 400);
    } catch (error) {
        console.error('Error fetching periods:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/periods
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newPeriod = await createDate({
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
