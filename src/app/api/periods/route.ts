import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { getMostRecentExpense, getExpenseDatesByCategory } from '@/lib/services/expenseService';
import {createPeriod, getPeriodByDate, getPeriodById, getSecondMostRecentPeriod} from "@/lib/services/periodService";
import { ok, fail } from '@/lib/utils/apiResponse'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const periodIdParam = searchParams.get('periodId');
    const categoryIdParam = searchParams.get('categoryId');
    const dateParam = searchParams.get('date');

    const userId = userIdParam ? parseInt(userIdParam) : NaN;
    if (isNaN(userId)) return fail('User ID is required and must be a number')

    try {
        // 1. Get period by ID
        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return fail('Period Id is required and must be a number')

            const period = await getPeriodById(periodId);
            return period ? ok(period) : fail('Could not find a period', 404)
        }

        // 2. Get most recent period for category
        if (categoryIdParam && req.url.includes('recent')) {
            const categoryId = parseInt(categoryIdParam);
            let date = new Date()
            if (isNaN(categoryId)) return fail('Category ID is required and must be a number')

            const latestExpense = await getMostRecentExpense(userId, categoryId);
            if (latestExpense) {
                date = latestExpense.date;
            }

            const period = await getPeriodByDate(date);
            return period ? ok(period) : fail('Could not find a period', 404)
        }

        // 3. Get all periods with expenses for category
        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return fail('Category ID is required and must be a number')

            const expenses = await getExpenseDatesByCategory(userId, categoryId);
            const seen = new Set<number>();
            const periods: any[] = [];

            for (const { date } of expenses) {
                const period = await getPeriodByDate(date);
                if (period && !seen.has(period.id)) {
                    seen.add(period.id);
                    periods.push(period);
                }
            }

            return periods ? ok(periods) : fail('No periods found', 404)
        }

        // 4. Pass in a date
        if (dateParam){
            const date = new Date(dateParam);
            const period = getPeriodByDate(date);

            return period ? ok(period) : fail('Could not find a period', 404)
        }

        const period = await getSecondMostRecentPeriod()
        return period ? ok(period) : fail('Invalid period')
    } catch (error) {
        console.error('Error fetching periods:', error);
        return fail('Internal server error', 500)
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const newPeriod = await createPeriod({
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            startingAmount: parseInt(body.startingAmount),
        });

        return ok(newPeriod, 'Successfully created period', 201);
    } catch (error) {
        console.error('Error creating period:', error);
        return fail('Internal server error', 500)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
