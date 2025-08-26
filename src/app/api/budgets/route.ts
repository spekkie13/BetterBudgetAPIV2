import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { handleGet } from '@/lib/http/shared/handle';
import { BudgetQuery, CreateBudgetBody } from '@/lib/http/budgets/budgetSchemas';
import {
    getBudgetsController,
    createBudgetController,
    updateBudgetController, deleteBudgetController
} from '@/lib/http/budgets/budgetController';

async function readJsonIfAny(req: NextRequest) {
    return req.headers.get('content-type')?.includes('application/json')
        ? await req.json().catch(() => ({}))
        : {};
}

export async function GET(req: NextRequest) {
    return handleGet(req, BudgetQuery, getBudgetsController);
}

export async function PUT(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const body = await readJsonIfAny(req);

    const result = await updateBudgetController(searchParams, body);

    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    );
}

export async function POST(req: NextRequest) {
    try {
        let bodyRaw = await req.json();
        bodyRaw = {
            ...bodyRaw,
            month: bodyRaw.periodMonth,
            amount: bodyRaw.amountCents
        }
        const parsed = CreateBudgetBody.safeParse(bodyRaw);
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

export async function DELETE(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;

    const result = await deleteBudgetController(searchParams);

    return new NextResponse(
        result.body === null ? null : JSON.stringify(result.body),
        { status: result.status, headers: corsHeaders }
    )
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
