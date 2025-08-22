import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { handleGet } from '@/lib/http/shared/handle';
import { BudgetQuery, CreateBudgetBody } from '@/lib/http/budgets/budgetSchemas';
import { getBudgetsController, createBudgetController } from '@/lib/http/budgets/budgetController';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    return handleGet(req, BudgetQuery, getBudgetsController);
}

export async function POST(req: NextRequest) {
    try {
        let bodyRaw = await req.json();
        bodyRaw = {
            ...bodyRaw,
            month: bodyRaw.periodMonth,
            amount: bodyRaw.amountCents
        }
        console.log(bodyRaw);
        const parsed = CreateBudgetBody.safeParse(bodyRaw);
        console.log(parsed);
        if (!parsed.success) {
            return new NextResponse(JSON.stringify({ error: 'Invalid body' }), {
                status: 400,
                headers: corsHeaders,
            });
        }
        const result = await createBudgetController(parsed.data);
        return new NextResponse(JSON.stringify(result.body), {
            status: result.status,
            headers: corsHeaders,
        });
    } catch (e) {
        console.error('Error creating budget:', e);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
}
