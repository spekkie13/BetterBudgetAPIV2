// app/api/teams/[teamId]/categories/[categoryId]/lines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { transactions as txn, transactionSplits as split } from '@/lib/db/schema';
import { and, eq, gte, lt, lt as ltOp, isNull } from 'drizzle-orm';

const Query = z.object({
    month: z.string().regex(/^\d{4}-\d{2}$/),
    limit: z.coerce.number().min(1).max(200).default(50),
    cursor: z.string().nullable().optional(), // ISO timestamp
});

const monthStartEnd = (yyyyMm: string) => {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return { start, end };
};

export async function GET(
    req: NextRequest,
    { params }: { params: { teamId: string; categoryId: string } }
) {
    const teamId = Number(params.teamId);
    const categoryId = Number(params.categoryId);
    if (!Number.isInteger(teamId) || !Number.isInteger(categoryId)) {
        return NextResponse.json({ error: 'Bad params' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = Query.safeParse({
        month: searchParams.get('month') ?? '',
        limit: searchParams.get('limit') ?? '50',
        cursor: searchParams.get('cursor'),
    });
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const { month, limit, cursor } = parsed.data;
    const { start, end } = monthStartEnd(month);
    const cursorDate = cursor ? new Date(cursor) : null;
    if (cursor && Number.isNaN(cursorDate!.getTime())) {
        return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }

    // Base-category lines (no splits)
    const baseWhere = and(
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        eq(txn.isTransfer, false),            // transfers won’t have categories/splits anyway
        eq(txn.categoryId, categoryId),
        ...(cursorDate ? [ltOp(txn.postedAt, cursorDate)] : [])
    );

    const base = await db
        .select({
            txn_id: txn.id,
            posted_at: txn.postedAt,
            amount_cents: txn.amountCents,
            is_transfer: txn.isTransfer,
            payee: txn.payee,
            memo: txn.memo,
        })
        .from(txn)
        .where(baseWhere);

    // Split lines (category comes from split table; amount from split.amountCents)
    const splitWhere = and(
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        eq(txn.isTransfer, false),
        eq(split.categoryId, categoryId),
        ...(cursorDate ? [ltOp(txn.postedAt, cursorDate)] : [])
    );

    const splitRows = await db
        .select({
            txn_id: txn.id,
            posted_at: txn.postedAt,
            amount_cents: split.amountCents,    // <— effective line amount comes from the split
            is_transfer: txn.isTransfer,
            payee: txn.payee,
            memo: txn.memo,
        })
        .from(txn)
        .innerJoin(split, eq(split.txnId, txn.id))
        .where(splitWhere);

    // Merge, sort (posted_at desc, txn_id desc), paginate
    const items = [...base, ...splitRows]
        .sort((a, b) => {
            const at = new Date(a.posted_at).getTime();
            const bt = new Date(b.posted_at).getTime();
            if (at !== bt) return bt - at;    // desc by time
            return Number(b.txn_id) - Number(a.txn_id); // desc by id
        })
        .slice(0, limit);

    const nextCursor = items.length ? items[items.length - 1].posted_at : null;

    return NextResponse.json({ items, nextCursor });
}
