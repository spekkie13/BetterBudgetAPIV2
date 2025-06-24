import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as periodService from '@/lib/services/periodService';
import { getMostRecentExpense, getExpenseDatesByCategory } from '@/lib/services/expenseService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const periodIdParam = searchParams.get('periodId');
    const categoryIdParam = searchParams.get('categoryId');
    const dateParam = searchParams.get('date');

    const userId = userIdParam ? parseInt(userIdParam) : NaN;
    if (isNaN(userId)) {
        return jsonWithCors({ error: 'userId is required and must be a number' }, 400);
    }

    try {
        // 1. Get period by ID
        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await periodService.getPeriodById(periodId);
            return jsonWithCors(period ?? {});
        }

        // 2. Get most recent period for category
        if (categoryIdParam && req.url.includes('recent')) {
            const categoryId = parseInt(categoryIdParam);
            let date = new Date()
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const latestExpense = await getMostRecentExpense(userId, categoryId);
            if (latestExpense) {
                date = latestExpense.date;
            }

            const period = await periodService.getPeriodByExpenseDate(date);
            return jsonWithCors(period ?? {});
        }

        // 3. Get all periods with expenses for category
        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const expenses = await getExpenseDatesByCategory(userId, categoryId);
            const seen = new Set<number>();
            const periods: any[] = [];

            for (const { date } of expenses) {
                const period = await periodService.getPeriodByExpenseDate(date);
                if (period && !seen.has(period.id)) {
                    seen.add(period.id);
                    periods.push(period);
                }
            }

            return jsonWithCors(periods);
        }

        // 4. Pass in a date
        if (dateParam){
            const date = new Date(dateParam);
            const period = await periodService.getPeriodByExpenseDate(date);

            if(!period){
                return jsonWithCors({ error: 'Could not find a period for the given date'}, 404)
            }

            return jsonWithCors(period)
        }

        return jsonWithCors({ error: 'Must provide periodId or categoryId' }, 400);
    } catch (error) {
        console.error('Error fetching periods:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const newPeriod = await periodService.createPeriod({
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
        });

        return jsonWithCors(newPeriod, 201);
    } catch (error) {
        console.error('Error creating period:', error);
        return jsonWithCors({ error: 'Failed to create period' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
