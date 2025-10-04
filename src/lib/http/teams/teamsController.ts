import { db } from '@/db/client';
import {categories, txn, transactionSplits} from '@/db/schema';
import {and, eq, gte, lt, isNull, or, SQL, inArray} from 'drizzle-orm';
import { LinesParamsInput, LinesQueryInput } from './linesSchemas';
import {monthStartEndUtc, decodeCursor2, encodeCursor, monthStartUtc, addMonthsUtc, toYmd} from './commonSchemas';
import {SpendTrendParamsInput, SpendTrendQueryInput} from "@/lib/http/teams/trendSchemas";
import {BudgetParamsInput, BudgetQueryInput} from "@/lib/http/teams/budgetSchemas";
import { getMonthSummary } from '@/lib/services/summary/summaryService';
import { deleteTeam, getTeamById, updateTeam, getTeams, createTeam } from '@/lib/services/team/teamService';
import { TeamIdParamsInput, UpdateTeamBodyInput } from './teamIdSchemas';
import { TeamsQueryInput, CreateTeamBodyInput } from './teamsSchemas';
import { toCents, monthToDate } from '@/lib/shared/helpers'

export async function getCategoryLinesController(params: LinesParamsInput, query: LinesQueryInput) {
    const { teamId, categoryId } = params;
    const { month, limit, cursor } = query;

    const { start, end } = monthStartEndUtc(month);
    const cur = decodeCursor2(cursor);

    const baseConds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        eq(txn.isTransfer, false),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
    ];
    // keyset: (postedAt < c) OR (postedAt = c AND id < cid)
    if (cur) {
        baseConds.push(
            or(lt(txn.postedAt, cur.postedAt), and(eq(txn.postedAt, cur.postedAt), lt(txn.id, cur.id)))
        );
    }

    // 1) Base-category (no split)
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
        .where(and(...(baseConds as SQL[]), eq(txn.categoryId, categoryId)));

    // 2) Split-category
    const splitRows = await db
        .select({
            txn_id: txn.id,
            posted_at: txn.postedAt,
            amount_cents: transactionSplits.amountCents,
            is_transfer: txn.isTransfer,
            payee: txn.payee,
            memo: txn.memo,
        })
        .from(txn)
        .innerJoin(transactionSplits, eq(transactionSplits.txnId, txn.id))
        .where(and(...(baseConds as SQL[]), eq(transactionSplits.categoryId, categoryId)));

    // 3) Merge, sort (posted_at desc, txn_id desc), slice
    const items = [...base, ...splitRows]
        .sort((a, b) => {
            const at = new Date(a.posted_at).getTime();
            const bt = new Date(b.posted_at).getTime();
            return at !== bt ? bt - at : (Number(b.txn_id) - Number(a.txn_id));
        })
        .slice(0, limit);

    const last = items.at(-1);
    const nextCursor = last ? encodeCursor(last.posted_at, Number(last.txn_id)) : null;

    return { status: 200, body: { items, nextCursor } };
}

export async function getSpendTrendController(params: SpendTrendParamsInput, query: SpendTrendQueryInput) {
    const { teamId } = params;
    const { months } = query;

    const now = new Date();
    const currentStart = monthStartUtc(now);
    const monthStarts: Date[] = [];
    for (let i = months - 1; i >= 0; i--) monthStarts.push(addMonthsUtc(currentStart, -i));
    const rangeStart = monthStarts[0];
    const rangeEnd = addMonthsUtc(currentStart, 1);

    const rows = await db
        .select({ postedAt: txn.postedAt, amountCents: txn.amountCents })
        .from(txn)
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            lt(txn.amountCents, 0),      // expenses only
            gte(txn.postedAt, rangeStart),
            lt(txn.postedAt, rangeEnd),
        ));

    const bucket = new Map<string, number>();
    for (const d of monthStarts) bucket.set(toYmd(d), 0);

    for (const r of rows) {
        const key = toYmd(monthStartUtc(new Date(r.postedAt)));
        bucket.set(key, (bucket.get(key) ?? 0) + (-Number(r.amountCents)));
    }

    const points = monthStarts.map(ms => ({ period_month: toYmd(ms), spent_cents: bucket.get(toYmd(ms)) ?? 0 }));
    return { status: 200, body: { points } };
}

export async function getBudgetController(params: BudgetParamsInput, query: BudgetQueryInput) {
    const { teamId } = params;
    const { month } = query;

    const summary = await getMonthSummary(teamId, month);

    const catIds = summary.map(s => s.categoryId);
    const catMeta = catIds.length
        ? await db
            .select({ id: categories.id, name: categories.name, color: categories.color, icon: categories.icon })
            .from(categories)
            .where(inArray(categories.id, catIds))
        : [];

    const metaMap = new Map<number, { name?: string; color?: string; icon?: string }>();
    for (const c of catMeta) metaMap.set(c.id, { name: c.name, color: c.color, icon: c.icon });

    const rows = summary
        .map(s => {
            const meta = metaMap.get(s.categoryId);
            return {
                category_id: s.categoryId,
                category_name: meta?.name ?? s.categoryName ?? null,
                category_color: meta?.color ?? null,
                category_icon: meta?.icon ?? null,
                budget_cents: toCents(s.budget),
                spent_cents: toCents(s.spent),
                remaining_cents: toCents(s.remaining),
                pct_spent: s.percentSpent,
            };
        })
        .sort((a, b) => {
            const an = (a.category_name ?? '').toLowerCase();
            const bn = (b.category_name ?? '').toLowerCase();
            return an === bn ? a.category_id - b.category_id : (an < bn ? -1 : 1);
        });

    const totals = {
        total_budget_cents: rows.reduce((acc, r) => acc + r.budget_cents, 0),
        total_spent_cents: rows.reduce((acc, r) => acc + r.spent_cents, 0),
        total_remaining_cents: rows.reduce((acc, r) => acc + r.remaining_cents, 0),
    };

    return {
        status: 200,
        body: { month, totals, categories: rows, period_month: monthToDate(month) },
    };
}

export async function getTeamByIdController(params: TeamIdParamsInput) {
    const team = await getTeamById(params.id);
    return team ? { status: 200, body: team } : { status: 404, body: { error: `Could not find a team with id ${params.id}` } };
}

export async function updateTeamController(params: TeamIdParamsInput, body: UpdateTeamBodyInput) {
    const updated = await updateTeam({ id: params.id, name: body.name });
    return { status: 200, body: updated };
}

export async function deleteTeamController(params: TeamIdParamsInput) {
    await deleteTeam(params.id);
    return { status: 204, body: null };
}

export async function listOrGetTeamController(query: TeamsQueryInput) {
    if (query.teamId !== undefined) {
        const team = await getTeamById(Number(query.teamId));
        return team ? { status: 200, body: team } : { status: 404, body: { error: 'No team found' } };
    }
    const all = await getTeams();
    return { status: 200, body: all };
}

export async function createTeamController(body: CreateTeamBodyInput) {
    const created = await createTeam({ name: body.name });
    return { status: 201, body: created };
}
