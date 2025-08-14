// app/api/teams/[teamId]/spend-trend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { transactions as txn } from '@/lib/db/schema';
import { and, eq, gte, lt, isNull, lt as ltOp } from 'drizzle-orm';

const Query = z.object({
    months: z.coerce.number().min(1).max(36).default(6),
});

// --- date helpers (UTC-normalized) ---
const monthStartUtc = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
const addMonthsUtc = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
const toYmd = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;

export async function GET(req: NextRequest, ctx : any) {
    const { teamId } = (ctx as { params: { teamId: string } }).params;
    if (!Number.isInteger(teamId)) {
        return NextResponse.json({ error: 'Bad teamId' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = Query.safeParse({ months: searchParams.get('months') ?? '6' });
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid months' }, { status: 400 });
    }
    const months = parsed.data.months;

    // Build the list of month starts [oldest ... current], inclusive
    const now = new Date();
    const currentStart = monthStartUtc(now);
    const monthStarts: Date[] = [];
    for (let i = months - 1; i >= 0; i--) {
        monthStarts.push(addMonthsUtc(currentStart, -i));
    }
    const rangeStart = monthStarts[0];              // oldest month start
    const rangeEnd = addMonthsUtc(currentStart, 1); // exclusive end (next month start)

    // Fetch all team expenses in the whole range (non-transfer, not deleted, negative amount)
    const rows = await db
        .select({
            postedAt: txn.postedAt,
            amountCents: txn.amountCents,
        })
        .from(txn)
        .where(and(
            eq(txn.teamId, Number(teamId)),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            ltOp(txn.amountCents, 0),              // expenses (negative)
            gte(txn.postedAt, rangeStart),
            lt(txn.postedAt, rangeEnd),
        ));

    // Bucket by month start and sum absolute cents
    const bucket = new Map<string, number>(); // key: "YYYY-MM-01" -> spent_cents
    for (const d of monthStarts) {
        bucket.set(toYmd(d), 0);
    }

    for (const r of rows) {
        const d = new Date(r.postedAt);
        const mStart = monthStartUtc(d);
        const key = toYmd(mStart);
        const prev = bucket.get(key) ?? 0;
        const spent = prev + (-Number(r.amountCents)); // amountCents is negative for expenses
        bucket.set(key, spent);
    }

    // Build points array ordered by month_start asc
    const points = monthStarts.map(ms => ({
        period_month: toYmd(ms),                  // "YYYY-MM-01"
        spent_cents: bucket.get(toYmd(ms)) ?? 0,  // bigint-like number
    }));

    return NextResponse.json({ points });
}
