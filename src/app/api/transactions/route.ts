// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import { getTransactions } from '@/lib/http/transactions/transactionController';
import { createTransaction, createTransfer } from '@/lib/services/transaction/transactionService';
import {z} from "zod";

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// validate query
const Query = z.object({
    teamId: z.coerce.number().int(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    cursor: z.string().nullable().optional(),
    id: z.coerce.number().int().optional(),
    categoryId: z.coerce.number().int().optional(),
});

// helper: current month as "YYYY-MM"
function currentMonthStr(): string {
    const now = new Date();
    const y = now.getUTCFullYear();
    const m = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const parsed = Query.safeParse({
        teamId: searchParams.get('teamId'),
        type: searchParams.get('type') ?? undefined,
        limit: searchParams.get('limit') ?? '50',
        cursor: searchParams.get('cursor'),
        id: searchParams.get('id') ?? undefined,
        categoryId: searchParams.get('categoryId') ?? undefined,
    });

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid query' }, { status: 400, headers: corsHeaders });
    }

    const q = parsed.data;
    const isMode2 = !!q.type; // mode switch

    const { status, body } = await getTransactions({
        teamId: q.teamId,
        // Mode 1: all transactions (month/type = undefined)
        // Mode 2: filtered for current month + type
        month: isMode2 ? currentMonthStr() : undefined,
        type: isMode2 ? q.type : undefined,
        limit: q.limit,
        cursor: q.cursor ?? null,
        id: q.id,
        categoryId: q.categoryId,
    });

    return NextResponse.json(body, { status, headers: corsHeaders });
}

/**
 * POST – unchanged logic, but already SRP-friendly since you delegate creation to services.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        console.log(body);
        // Transfer
        if (body?.isTransfer || (body?.fromAccountId && body?.toAccountId)) {
            const teamId = Number(body?.teamId);
            const fromAccountId = Number(body?.fromAccountId);
            const toAccountId = Number(body?.toAccountId);
            const amount = Number(body?.amount);
            const date = new Date(body?.date);

            if (!Number.isInteger(teamId)) return fail('Invalid teamId', 400);
            if (!Number.isInteger(fromAccountId) || !Number.isInteger(toAccountId)) return fail('Invalid account ids', 400);
            if (!Number.isFinite(amount)) return fail('Invalid amount', 400);
            if (Number.isNaN(date.getTime())) return fail('Invalid date', 400);

            const result = await createTransfer({
                teamId,
                fromAccountId,
                toAccountId,
                amount,
                date,
                memo: body?.memo,
                createdBy: body?.createdBy ?? null,
            });
            return ok(result, 'Transfer created', 201);
        }

        // Regular income/expense
        const teamId = Number(body?.teamId);
        const accountId = Number(body?.accountId);
        const amount = Number(body?.amount);
        const date = new Date(body?.date);

        if (!Number.isInteger(teamId)) return fail('Invalid teamId', 400);
        if (!Number.isInteger(accountId)) return fail('Invalid accountId', 400);
        if (!Number.isFinite(amount)) return fail('Invalid amount', 400);
        if (Number.isNaN(date.getTime())) return fail('Invalid date', 400);

        const created = await createTransaction({
            teamId,
            accountId,
            amount,
            date,
            categoryId: body?.categoryId !== undefined ? Number(body.categoryId) : undefined,
            payee: body?.payee,
            description: body?.description,
            createdBy: body?.createdBy ?? null,
            currency: body?.currency,
            splits: Array.isArray(body?.splits) ? body.splits : undefined,
        });

        return ok(created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail('Internal server error', 500);
    }
}
