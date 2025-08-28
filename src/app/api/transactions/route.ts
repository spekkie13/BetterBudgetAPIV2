// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import { getTransactions } from '@/lib/http/transactions/transactionController';
import { createTransaction, createTransfer } from '@/lib/services/transaction/transactionService';
import { z } from 'zod';

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// ── Query validation ───────────────────────────────────────────────────────────
/**
 * mode:
 *  - 1 = all-time scope (ignore month unless explicitly provided for future flexibility)
 *  - 2 = month scope (uses ?month=YYYY-MM or defaults to current month)
 * default: backward compatible:
 *   - if ?type present → mode 2
 *   - else → mode 1
 */
const Query = z.object({
    teamId: z.coerce.number().int(),
    mode: z.coerce.number().int().optional(),                     // 1 | 2
    month: z
        .string()
        .regex(/^\d{4}-\d{2}$/, 'month must be YYYY-MM')
        .optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    limit: z.coerce.number().int().min(1).max(200).default(50),
    cursor: z.string().nullable().optional(),
    id: z.coerce.number().int().optional(),
    categoryId: z.coerce.number().int().optional(),
    accountId: z.coerce.number().int().optional(),
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
        mode: searchParams.get('mode') ?? undefined,
        month: searchParams.get('month') ?? undefined,
        type: searchParams.get('type') ?? undefined,
        limit: searchParams.get('limit') ?? '50',
        cursor: searchParams.get('cursor'),
        id: searchParams.get('id') ?? undefined,
        categoryId: searchParams.get('categoryId') ?? undefined,
        accountId: searchParams.get('accountId') ?? undefined,
    });

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error }, { status: 400, headers: corsHeaders });
    }

    const q = parsed.data;

    // ── Mode resolver (backward compatible) ─────────────────────────────────────
    // If a mode is specified, honor it. Else: if type present → mode2, else mode1.
    const resolvedMode: 1 | 2 = ((): 1 | 2 => {
        if (q.mode === 1 || q.mode === 2) return q.mode as 1 | 2;
        return q.type ? 2 : 1;
    })();

    // month handling:
    // - mode 2: use provided ?month or fallback to the current month
    // - mode 1: ignore month (all-time)
    const month = resolvedMode === 2 ? (q.month ?? currentMonthStr()) : undefined;

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const { status, body } = await getTransactions({
        teamId: q.teamId,
        month,                 // undefined for all-time (mode 1)
        type: q.type,          // optional
        limit: q.limit,
        cursor: q.cursor ?? null,
        id: q.id,
        categoryId: q.categoryId,
        accountId: q.accountId ?? 0,
    });

    return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const int = (v: unknown) => {
            const n = Number(v);
            return Number.isInteger(n) ? n : NaN;
        };
        const postedAtStr = body?.postedAt ?? body?.date ?? body?.createdAt;
        const postedAt = new Date(postedAtStr ?? NaN);

        const fromAccountId = int(body?.fromAccountId ?? body?.fromAccountID);
        const toAccountId   = int(body?.toAccountId   ?? body?.toAccountID);
        const accountId     = int(body?.accountId ?? body?.fromAccountId ?? body?.fromAccountID);
        const teamId        = int(body?.teamId);
        const amountCents   = Number(body?.amountCents);

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
                amountCents,
                postedAt,
                memo: body?.memo ?? null,
                createdBy: body?.createdBy ?? null,
                currency: body?.currency
            });

            return ok(result, 'Transfer created', 201);
        }

        requireInt(Number.isInteger(accountId), 'Invalid accountId');

        const transactionData = {
            teamId,
            accountId,
            amountCents,
            postedAt,
            categoryId: body?.categoryId != null ? int(body.categoryId) : undefined,
            payee: body?.payee ?? null,
            memo: body?.description ?? body?.memo ?? null,
            createdBy: body?.createdBy ?? null,
            createdAt: body.createdAt,
            updatedAt: body.updatedAt,
            currency: body?.currency,
            splits: Array.isArray(body?.splits) ? body.splits : undefined
        };

        const created = await createTransaction(transactionData);
        return ok(created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail('Internal server error', 500);
    }
}
