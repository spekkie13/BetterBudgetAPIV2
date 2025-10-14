import { db } from '@/db/client';
import { categories, txn, transactionSplits } from '@/db/schema';
import { and, eq, gte, lt, isNull, or, SQL, inArray } from 'drizzle-orm';
import { getMonthSummary } from '@/adapters/services/summaryService';
import { TeamService } from '@/adapters/services/teamService';
import { addMonthsUTC, monthStartEndUtc, firstOfMonthUTC, monthToDate, toYmd } from "@/core/date";
import { decodeDateCursor2, encodeDateCursor } from "@/core/cursor";
import { toCents } from "@/core/cents";
import { TeamBodyInput, TeamPatch } from "@/db/types/teamTypes";
import { ApiDataResponse } from "@/core/http/ApiDataResponse";

export function makeTeamsController(svc: TeamService) {
    return {
        async createTeam(body: TeamBodyInput) {
            const created = await svc.insert({ name: body.name });
            return created ?
                new ApiDataResponse({ data: created, status: 201, message: 'successfully created' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'No team created' });
        },

        async updateTeam(teamId: number, body: TeamPatch) {
            const updated = await svc.updateById(teamId, body);
            return updated ?
                new ApiDataResponse({ data: updated, status: 201, message: 'successfully created' }) :
                new ApiDataResponse({ data: null, status: 400, message: 'No team updated' });
        },

        async deleteTeam(teamId: number) {
            await svc.deleteById(teamId);
            return new ApiDataResponse({ data: null, status: 204, message: 'successfully deleted' });
        },

        async getCategoryLines(teamId: number, categoryId: number, month: string, limit: number, cursor: string | null | undefined) {
            const { start, end } = monthStartEndUtc(month);
            const cur = decodeDateCursor2(cursor);

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
            const nextCursor = last ? encodeDateCursor(last.posted_at, Number(last.txn_id)) : null;

            return new ApiDataResponse({
                data: { items, nextCursor },
                status: 200,
                message: 'Successfully fetched category lines',
            })
        },

        async getSpendTrend(teamId: number, months: number) {
            const now = new Date();
            const currentStart = firstOfMonthUTC(now);
            const monthStarts: Date[] = [];
            for (let i = months - 1; i >= 0; i--) monthStarts.push(addMonthsUTC(currentStart, -i));
            const rangeStart = monthStarts[0];
            const rangeEnd = addMonthsUTC(currentStart, 1);

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
                const key = toYmd(firstOfMonthUTC(new Date(r.postedAt)));
                bucket.set(key, (bucket.get(key) ?? 0) + (-Number(r.amountCents)));
            }

            const points = monthStarts.map(ms => ({ period_month: toYmd(ms), spent_cents: bucket.get(toYmd(ms)) ?? 0 }));
            return points ?
                new ApiDataResponse({ data: points, status: 200, message: 'Successfully fetched spending trends'}) :
                new ApiDataResponse({ data: null, status: 400, message: 'No spend trends fetched'})
        },

        async getBudget(teamId: number, month: string) {
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

            return new ApiDataResponse({
                status: 200,
                data: { month, totals, categories: rows, period_month: monthToDate(month) },
                message: 'Successfully fetched budget',
            });
        },

        async getTeamById(teamId: number) {
            const team = await svc.selectById(teamId);
            return team ?
                new ApiDataResponse({ data: team, status: 200, message: 'Successfully fetched team' }) :
                new ApiDataResponse({ data: null, status: 404, message: 'No team found' });
        },

        async selectAll() {
            const teams = await svc.listAll()
            return (teams && teams.length > 0) ?
                new ApiDataResponse({ data: teams, status: 200, message: 'Successfully fetched teams' }) :
                new ApiDataResponse({ data: null, status: 404, message: 'No teams found' });
        }
    }
}
