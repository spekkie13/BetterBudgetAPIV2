import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { createExpense, getAllExpenses, getExpenseById, getExpensesByCategory, getExpensesByUserAndCategoryAndPeriod, getExpensesByUserAndPeriod } from '@/lib/services/expenseService';
import { createPeriodIfNotExists, getPeriodById} from '@/lib/services/periodService';
import { Decimal } from '@prisma/client/runtime/library';
import {createBudgetIfNotExists} from "@/lib/services/budgetService";
import {createResultIfNotExists} from "@/lib/services/resultService";
import { ok, fail } from '@/lib/utils/apiResponse'
import {isValid} from "@/lib/helpers";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const idParam = searchParams.get('id');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (!isValid(userIdParam)) return fail('Invalid userId param', 400);
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) return fail('User ID is invalid', 400);

        if (isValid(idParam)) {
            const id = parseInt(idParam);
            if (isNaN(id)) return fail('Invalid id', 400);
            const expense = await getExpenseById(userId, id);
            return ok(expense ?? {});
        }

        if (categoryIdParam && periodIdParam) {
            const categoryId = parseInt(categoryIdParam);
            const periodId = parseInt(periodIdParam);
            if (isNaN(categoryId)) return fail('Invalid categoryId', 400);
            if (isNaN(periodId)) return fail('Invalid periodId', 400);

            const period = await getPeriodById(periodId)
            if (!period) return fail('No period found', 404)
            const expenses = await getExpensesByUserAndCategoryAndPeriod(userId, categoryId, period);
            return ok(expenses)
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return fail('Invalid categoryId', 400);
            const expenses = await getExpensesByCategory(userId, categoryId);
            return ok(expenses)
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return fail('Invalid periodId', 400);
            const period = await getPeriodById(periodId);
            if (!period) return fail('No period found', 404)
            const expenses = await getExpensesByUserAndPeriod(userId, period);
            return ok(expenses)
        }

        const allExpenses = await getAllExpenses(userId);
        return ok(allExpenses)
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return fail('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { date, ...rest } = body;
        const parsedDate = new Date(date);
        const startingAmount = rest.startingAmount

        let period = await createPeriodIfNotExists(parsedDate, startingAmount);
        await createBudgetIfNotExists(period, rest)
        await createResultIfNotExists(period, rest)

        const expenseData = {
            ...rest,
            amount: Decimal(rest.amount),
            isRecurring: rest.isRecurring,
            date: parsedDate.toISOString(),  // Use constructed and validated date
            categoryId: Number(rest.categoryId),
            userId: Number(rest.userId),
        };

        const newExpense = await createExpense(expenseData);
        return ok(newExpense, 'Expense created successfully', 201)
    } catch (error) {
        console.error('Error creating expense:', error);
        return fail('Internal server error', 500);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
