// app/api/teams/[teamId]/budget/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { categories } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';
import { getMonthSummary } from '@/lib/services/summaryService';

const Query = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) });
const monthToDate = (yyyyMm: string) => `${yyyyMm}-01`;
const toCents = (n: number) => Math.round(Number(n) * 100);

export async function GET(req: NextRequest, { params }: { params: { teamId: string } }) {
    const teamId = Number(params.teamId);
    if (!Number.isInteger(teamId)) {
        return NextResponse.json({ error: 'Bad teamId' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = Query.safeParse({ month: searchParams.get('month') ?? '' });
    if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }
    const month = parsed.data.month;
    const monthStart = monthToDate(month);

    // 1) Compute summary (budget/spent/remaining/percent) per category
    const summary = await getMonthSummary(teamId, month);

    // 2) Enrich with category color/icon (summary already has name/type)
    const catIds = summary.map(s => s.categoryId);
    const catMeta = catIds.length
        ? await db
            .select({
                id: categories.id,
                name: categories.name,
                color: categories.color,
                icon: categories.icon,
            })
            .from(categories)
            .where(inArray(categories.id, catIds))
        : [];

    const metaMap = new Map<number, { name?: string; color?: string; icon?: string }>();
    for (const c of catMeta) metaMap.set(c.id, { name: c.name, color: c.color, icon: c.icon });

    // 3) Build rows in the same shape your old SQL returned
    const rows = summary
        .map((s) => {
            const meta = metaMap.get(s.categoryId);
            return {
                category_id: s.categoryId,
                category_name: meta?.name ?? s.categoryName ?? null,
                category_color: meta?.color ?? null,
                category_icon: meta?.icon ?? null,
                budget_cents: toCents(s.budget),
                spent_cents: toCents(s.spent),
                remaining_cents: toCents(s.remaining),
                pct_spent: s.percentSpent, // number | null
            };
        })
        // sort by category_name asc (fallback to id for stability)
        .sort((a, b) => {
            const an = (a.category_name ?? '').toLowerCase();
            const bn = (b.category_name ?? '').toLowerCase();
            if (an === bn) return a.category_id - b.category_id;
            return an < bn ? -1 : 1;
        });

    // 4) Totals
    const totals = {
        total_budget_cents: rows.reduce((acc, r) => acc + r.budget_cents, 0),
        total_spent_cents: rows.reduce((acc, r) => acc + r.spent_cents, 0),
        total_remaining_cents: rows.reduce((acc, r) => acc + r.remaining_cents, 0),
    };

    return NextResponse.json({
        month,
        totals,
        categories: rows,
        period_month: monthStart, // optional: mirrors the old API’s concept
    });
}
