// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import { db } from '@/lib/db/client';
import { transactions as txn, transactionSplits as splits } from '@/lib/db/schema';
import {
    and, eq, gte, lt, desc, isNull, inArray, SQL, gt,
} from 'drizzle-orm';
import {
    getTransactionById,
    createTransaction,
    createTransfer,
} from '@/lib/services/transactionService';
import { z } from 'zod';

const Query = z.object({
    teamId: z.string().transform(Number),
    month: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    type: z.enum(['income', 'expense', 'transfer']).optional(),
    categoryId: z.string().transform(v => (v === '' || v == null ? undefined : Number(v))).optional(),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(200)).default('50' as any),
    cursor: z.string().nullable().optional(), // ISO timestamp
    id: z.string().transform(v => (v === '' || v == null ? undefined : Number(v))).optional(),
});

function monthRange(yyyyMm: string) {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)); // exclusive
    return { start, end };
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const parsed = Query.safeParse({
        teamId: searchParams.get('teamId'),
        month: searchParams.get('month') ?? undefined,
        type: searchParams.get('type') ?? undefined,
        categoryId: searchParams.get('categoryId') ?? undefined,
        limit: searchParams.get('limit') ?? '50',
        cursor: searchParams.get('cursor'),
        id: searchParams.get('id') ?? undefined,
    });

    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid query' }, { status: 400, headers: corsHeaders });
    }

    const { teamId, month, type, categoryId, limit, cursor, id } = parsed.data;

    if (!Number.isInteger(teamId)) {
        return NextResponse.json({ error: 'Invalid teamId' }, { status: 400, headers: corsHeaders });
    }

    // /api/transactions?teamId=1&id=123
    if (id !== undefined) {
        if (!Number.isInteger(id)) return fail('Invalid id', 400);
        const row = await getTransactionById(teamId, id);
        return ok(row ?? {});
    }

    // From here on: list with filters
    if (!month) {
        // For your test suite we require a month for listing
        return NextResponse.json({ error: 'month is required (YYYY-MM)' }, { status: 400, headers: corsHeaders });
    }

    const { start, end } = monthRange(month);
    const cursorDate = cursor ? new Date(cursor) : null;

    // Base conditions shared across queries
    const baseConds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),                  // exclusive end
        cursorDate ? lt(txn.postedAt, cursorDate) : undefined, // keyset pagination
    ];

    // Transfer/non-transfer + sign filters (for base txn)
    if (type === 'transfer') {
        baseConds.push(eq(txn.isTransfer, true));
    } else {
        baseConds.push(eq(txn.isTransfer, false));
        if (type === 'expense') baseConds.push(lt(txn.amountCents, 0 as any));
        if (type === 'income')  baseConds.push(gt(txn.amountCents, 0 as any));
    }

    // No category filter -> simple fast path
    if (categoryId === undefined) {
        const items = await db
            .select()
            .from(txn)
            .where(and(...(baseConds.filter(Boolean) as SQL[])))
            .orderBy(desc(txn.postedAt), desc(txn.id))
            .limit(limit);

        const nextCursor = items.at(-1)?.postedAt ?? null;
        return NextResponse.json({ items, nextCursor }, { headers: corsHeaders });
    }

    // Category filter (split-aware):
    // 1) Matches where base transaction has this category
    const baseMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(txn)
        .where(and(...(baseConds.filter(Boolean) as SQL[]), eq(txn.categoryId, categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    // 2) Matches where a split has this category
    const splitMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(splits)
        .innerJoin(txn, eq(splits.txnId, txn.id))
        .where(and(...(baseConds.filter(Boolean) as SQL[]), eq(splits.categoryId, categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    // 3) Merge distinct by txn id, sort, slice
    const seen = new Set<number>();
    const merged = [...baseMatches, ...splitMatches]
        .filter(r => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
        })
        .sort((a, b) => {
            const dt = b.postedAt.getTime() - a.postedAt.getTime();
            return dt !== 0 ? dt : b.id - a.id;
        })
        .slice(0, limit);

    if (merged.length === 0) {
        return NextResponse.json({ items: [], nextCursor: null }, { headers: corsHeaders });
    }

    // 4) Hydrate rows for those ids (keeps stable order by postedAt desc, id desc)
    const ids = merged.map(m => m.id);
    const items = await db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), inArray(txn.id, ids)))
        .orderBy(desc(txn.postedAt), desc(txn.id));

    const nextCursor = merged.at(-1)?.postedAt ?? null;
    return NextResponse.json({ items, nextCursor }, { headers: corsHeaders });
}

/**
 * POST – create (income/expense or transfer)
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Transfer path
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

        // Regular income/expense path
        const teamId = Number(body?.teamId);
        const accountId = Number(body?.accountId);
        const amount = Number(body?.amount); // positive number; service sets sign
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
