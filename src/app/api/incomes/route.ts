import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { createIncome, getAllIncomes, getIncomeById, getIncomesByPeriod } from '@/lib/services/incomeService';
import { getPeriodById } from '@/lib/services/periodService';
import {isValid} from "@/lib/helpers";
import { ok, fail } from '@/lib/utils/apiResponse'


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const idParam = searchParams.get('id');
    const periodIdParam = searchParams.get('periodId');

    try {
        if (!isValid(userIdParam) || isNaN(parseInt(userIdParam))) return fail('Provide a valid user ID')
        const userId = parseInt(userIdParam!);

        if (idParam) {
            const id = parseInt(idParam!);
            if (isNaN(id)) return fail('Invalid income ID');

            const income = await getIncomeById(userId, id);
            return income ? ok(income) : fail('No income found', 404)
        }

        if (periodIdParam) {
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return fail('Invalid periodId');

            const period = await getPeriodById(periodId);
            if (!period) return fail('No period found', 404)

            const incomes = await getIncomesByPeriod(userId, period);
            return incomes ? ok(incomes) : fail('No incomes found', 404)
        }

        const allIncomes = await getAllIncomes(userId);
        return allIncomes ? ok(allIncomes) : fail('No incomes found for user: ' + userId, 404)
    } catch (error) {
        console.error('Error fetching incomes:', error);
        return fail('Failed to fetch incomes')
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
        return ok(newIncome, 'Successfully created new income', 201)
    } catch (error) {
        console.error('Error creating expense:', error);
        return fail('Failed to create income')
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
