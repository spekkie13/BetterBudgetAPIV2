import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import {
    createExpense,
    getAllExpenses,
    getExpenseById,
    getExpensesByCategory,
    getExpensesByPeriod,
} from '@/lib/services/expenseService';
import { getPeriodById } from '@/lib/services/periodService';

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
            const expenses = await getExpensesByPeriod(userId, period);
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
        const expenseData = {
            ...body,
            isRecurring: body.isRecurring,
            date: new Date(body.date),
            categoryId: Number(body.categoryId),
            userId: Number(body.userId),
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
