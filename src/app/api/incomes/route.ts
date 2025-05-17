// File: /app/api/incomes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {getPeriodById} from "@/lib/services/periodService";
import {
    createIncome,
    getIncomeById,
    getIncomesByPeriod,
    getIncomesByUserId
} from "@/lib/services/incomeService";

// GET /api/incomes?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const periodIdParam = searchParams.get('periodId');
    const idParam = searchParams.get('id');
    const userIdParam = searchParams.get('userId');

    try {
        if(!userIdParam) {
            return jsonWithCors({ error: "user ID is required" }, 400);
        }
        const userId = parseInt(userIdParam)
        if(isNaN(userId)) {
            return jsonWithCors({ error: "user ID is invalid" }, 400);
        }

        if(periodIdParam){
            const periodId = parseInt(periodIdParam);
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400);

            const period = await getPeriodById(periodId);

            if (!period) return jsonWithCors({});

            const incomes = getIncomesByPeriod(period)

            return jsonWithCors(incomes);
        }
        if(idParam){
            const id = parseInt(idParam)
            if (isNaN(id)) return jsonWithCors({ error: 'Invalid Id' }, 400);

            const incomes = await getIncomeById(id)
            return jsonWithCors(incomes);
        }

        const incomes = await getIncomesByUserId(userId)
        return jsonWithCors(incomes);
    } catch (error) {
        console.error('Error fetching incomes:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newIncome = await createIncome(body);

        return jsonWithCors(newIncome, 201);
    } catch (error) {
        console.error('Error creating income:', error);
        return jsonWithCors({ error: 'Failed to create income' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
