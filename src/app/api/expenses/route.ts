import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { createExpense, getAllExpenses, getExpenseById, getExpensesByCategory, getExpensesByUserAndCategoryAndPeriod, getExpensesByUserAndPeriod } from '@/lib/services/expenseService';
import { getPeriodById } from '@/lib/services/periodService';
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const idParam = searchParams.get('id');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (!userIdParam) return jsonWithCors({ error: 'User ID is required' }, 400);
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) return jsonWithCors({ error: 'User ID is invalid' }, 400);

        if (idParam) {
            const id = parseInt(idParam);
            if (isNaN(id)) return jsonWithCors({ error: 'Invalid id' }, 400);
            const expense = await getExpenseById(userId, id);
            return jsonWithCors(expense ?? {});
        }

        if (categoryIdParam && periodIdParam) {
            const categoryId = parseInt(categoryIdParam);
            const periodId = parseInt(periodIdParam);
            console.log('fetching expenses by category and period')
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await getPeriodById(periodId)
            if (!period) return jsonWithCors({});
            const expenses = await getExpensesByUserAndCategoryAndPeriod(userId, categoryId, period);
            return jsonWithCors(expenses);
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);
            const expenses = await getExpensesByCategory(userId, categoryId);
            return jsonWithCors(expenses);
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);
            const period = await getPeriodById(periodId);
            if (!period) return jsonWithCors({});
            const expenses = await getExpensesByUserAndPeriod(userId, period);
            return jsonWithCors(expenses);
        }

        const allExpenses = await getAllExpenses(userId);
        return jsonWithCors(allExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, ...rest } = body;
        const parsedDate = new Date(date);

        const expenseData = {
            ...rest,
            amount: Decimal(rest.amount),
            isRecurring: rest.isRecurring,
            date: parsedDate.toISOString(),  // Use constructed and validated date
            categoryId: Number(rest.categoryId),
            userId: Number(rest.userId),
        };

        const newExpense = await createExpense(expenseData);
        return jsonWithCors(newExpense, 201);
    } catch (error) {
        console.error('Error creating expense:', error);
        return jsonWithCors({ error: 'Failed to create expense' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
