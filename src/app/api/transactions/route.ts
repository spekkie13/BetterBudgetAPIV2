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
        console.log(body)
        // --- Normalize IDs and date aliases ---
        const int = (v: unknown) => {
            const n = Number(v);
            return Number.isInteger(n) ? n : NaN;
        };
        const postedAtStr = body?.postedAt ?? body?.date ?? body?.createdAt;
        const postedAt = new Date(postedAtStr ?? NaN);

        // Accept both camel and legacy capital-ID keys from client
        const fromAccountId = int(body?.fromAccountId ?? body?.fromAccountID);
        const toAccountId   = int(body?.toAccountId   ?? body?.toAccountID);
        const accountId     = int(body?.accountId ?? body?.fromAccountId ?? body?.fromAccountID);
        const teamId        = int(body?.teamId);

        // amounts are signed cents (no conversion!)
        const amountCents = Number(body?.amountCents);

        // Quick validators with clear messages
        const requireInt = (ok: boolean, msg: string) => { if (!ok) return fail(msg, 400); };

        if (Number.isNaN(postedAt.getTime())) return fail('Invalid postedAt/date/createdAt', 400);
        if (!Number.isInteger(teamId))        return fail('Invalid teamId', 400);
        if (!Number.isFinite(amountCents))    return fail('Invalid amountCents', 400);

        const isTransfer = Boolean(body?.isTransfer) ||
            (Number.isInteger(fromAccountId) && Number.isInteger(toAccountId));

        if (isTransfer) {
            requireInt(Number.isInteger(fromAccountId) && Number.isInteger(toAccountId), 'Invalid account ids');
            if (fromAccountId === toAccountId) return fail('fromAccountId and toAccountId must differ', 400);
            if (amountCents <= 0)              return fail('Transfer amountCents must be > 0', 400);

            const result = await createTransfer({
                teamId,
                fromAccountId,
                toAccountId,
                amountCents,         // positive signed cents
                postedAt,
                memo: body?.memo ?? null,
                createdBy: body?.createdBy ?? null,
                currency: body?.currency
            });

            return ok(result, 'Transfer created', 201);
        }

        // Regular income/expense
        requireInt(Number.isInteger(accountId), 'Invalid accountId');

        const transactionData = {
            teamId,
            accountId,
            amountCents,           // signed cents; expense < 0, income > 0
            postedAt,
            categoryId: body?.categoryId != null ? int(body.categoryId) : undefined,
            payee: body?.payee ?? null,
            memo: body?.description ?? body?.memo ?? null,
            createdBy: body?.createdBy ?? null,
            createdAt: body.createdAt,
            updatedAt: body.updatedAt,
            currency: body?.currency,
            splits: Array.isArray(body?.splits) ? body.splits : undefined // expect signed cents
        }
        console.log(transactionData)
        const created = await createTransaction(transactionData);

        return ok(created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail('Internal server error', 500);
    }
}
