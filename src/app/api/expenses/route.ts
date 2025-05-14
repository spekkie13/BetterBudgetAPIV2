// File: /app/api/expenses/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {
    createExpense,
    getAllExpenses,
    getExpenseByCategoryId,
    getExpenseById,
    getExpenseByPeriodId
} from "@/lib/services/expenseService";
import {getPeriodById} from "@/lib/services/dateService";

// GET /api/expenses or ?id=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (idParam) {
            const id = parseInt(idParam);
            if (isNaN(id)) return jsonWithCors({ error: 'Invalid id' }, 400);

            const expense = await getExpenseById(id)
            return jsonWithCors(expense ? [expense] : []);
        }

        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);

            const expenses = await getExpenseByCategoryId(categoryId);

            return jsonWithCors(expenses);
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await getPeriodById(periodId);

            if (!period) return jsonWithCors([]);

            const expenses = await getExpenseByPeriodId(period);

            return jsonWithCors(expenses);
        }

        const allExpenses = await getAllExpenses()
        return jsonWithCors(allExpenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newExpense = await createExpense(body);

        return jsonWithCors(newExpense, 201);
    } catch (error) {
        console.error('Error creating expense:', error);
        return jsonWithCors({ error: 'Failed to create expense' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
