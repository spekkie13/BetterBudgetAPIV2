import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { createIncome, getAllIncomes, getIncomeById, getIncomesByPeriod } from '@/lib/services/incomeService';
import { getPeriodById } from '@/lib/services/periodService';


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const idParam = searchParams.get('id');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (!userIdParam) {
            return jsonWithCors({ error: 'User ID is required' }, 400);
        }
        const userId = parseInt(userIdParam);
        if (isNaN(userId)) {
            return jsonWithCors({ error: 'User ID is invalid' }, 400);
        }

        if (idParam) {
            const id = parseInt(idParam);
            if (isNaN(id)) return jsonWithCors({ error: 'Invalid income ID' }, 400);

            const income = await getIncomeById(userId, id);
            return jsonWithCors(income ? income : {});
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await getPeriodById(periodId);
            if (!period) return jsonWithCors({});

            const incomes = await getIncomesByPeriod(userId, period);
            return jsonWithCors(incomes);
        }

        const allIncomes = await getAllIncomes(userId);
        return jsonWithCors(allIncomes);
    } catch (error) {
        console.error('Error fetching incomes:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body);
        const { date, ...rest } = body;
        const parsedDate = new Date(date);

        const incomeData = {
            amount: Number(rest.amount),
            date: parsedDate.toISOString(),  // Use constructed and validated date
            userId: Number(rest.userId),
        };

        const newIncome = await createIncome(incomeData);
        return jsonWithCors(newIncome, 201);
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
