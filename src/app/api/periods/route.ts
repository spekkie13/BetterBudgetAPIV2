// File: /app/api/periods/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {createDate, getExpensesGroupedByMonthYear, getPeriodByExpenseDate} from "@/lib/services/dateService";
import {getMostRecentExpense} from "@/lib/services/expenseService";

// GET /api/periods or /api/periods?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const periodIdParam = searchParams.get('periodId');
    const userIdParam = searchParams.get('userId');
    const categoryIdParam = searchParams.get('categoryId');

    try {
        if (userIdParam) {
            const userId = parseInt(userIdParam);
            if (isNaN(userId)) {
                return jsonWithCors({ error: 'Invalid user ID'}, 400)
            }

            if (periodIdParam) {
                const periodId = parseInt(periodIdParam);
                if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

                const period = await getExpensesGroupedByMonthYear();
                const single = period.find(p => p.id === periodId);
                return jsonWithCors(single ? single : {});
            }
            if (categoryIdParam) {
                const categoryId = parseInt(categoryIdParam);
                if (isNaN(categoryId)) {
                    return jsonWithCors({ error: 'Invalid categoryId' }, 400);
                }
                const expense = await getMostRecentExpense(userId, categoryId);
                const period = await getPeriodByExpenseDate(expense?.date);
                return jsonWithCors(period);
            }
            const allPeriods = await getExpensesGroupedByMonthYear();
            return jsonWithCors(allPeriods);
        }else{
            return jsonWithCors({ error: 'User ID is required'}, 400)
        }
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
