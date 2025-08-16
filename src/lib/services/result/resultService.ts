// services/resultService.ts
import { getMonthSummary } from '@/lib/services/summary/summaryService';
import { toCents, monthToDate } from '@/lib/shared/helpers'

type ProgressRow = {
    team_id: number;
    category_id: number;
    period_month: string;       // "YYYY-MM-01"
    budget_cents: number;       // bigint-ish number (in cents)
    spent_cents: number;        // positive (abs expenses)
    remaining_cents: number;    // budget - spent
    pct_spent: number | null;   // percent or null when budget 0
};

/** Single category progress for a team & month */
export async function getResultByCategoryAndMonth(
    teamId: number,
    categoryId: number,
    month: string
): Promise<ProgressRow | null> {
    const periodMonth = monthToDate(month);
    const summary = await getMonthSummary(teamId, month);
    const row = summary.find(s => s.categoryId === categoryId);
    if (!row) return null;

    return {
        team_id: teamId,
        category_id: categoryId,
        period_month: periodMonth,
        budget_cents: toCents(row.budget),
        spent_cents: toCents(row.spent),
        remaining_cents: toCents(row.remaining),
        pct_spent: row.percentSpent, // already number | null
    };
}

/** All category results for a team & month (table data for the Budget screen) */
export async function getResultsByMonth(teamId: number, month: string): Promise<ProgressRow[]> {
    const periodMonth = monthToDate(month);
    const summary = await getMonthSummary(teamId, month);

    return summary.map(s => ({
        team_id: teamId,
        category_id: s.categoryId,
        period_month: periodMonth,
        budget_cents: toCents(s.budget),
        spent_cents: toCents(s.spent),
        remaining_cents: toCents(s.remaining),
        pct_spent: s.percentSpent,
    })).sort((a, b) => a.category_id - b.category_id);
}

/** Month totals (header summary) */
export async function getMonthTotals(teamId: number, month: string) {
    const rows = await getResultsByMonth(teamId, month);

    const total_budget_cents   = rows.reduce((a, r) => a + r.budget_cents, 0);
    const total_spent_cents    = rows.reduce((a, r) => a + r.spent_cents, 0);
    const total_remaining_cents = rows.reduce((a, r) => a + r.remaining_cents, 0);

    return { total_budget_cents, total_spent_cents, total_remaining_cents };
}

/** Convenience: results + totals in one call */
export async function getMonthOverview(teamId: number, month: string) {
    const [categories, totals] = await Promise.all([
        getResultsByMonth(teamId, month),
        getMonthTotals(teamId, month),
    ]);
    return { month, totals, categories };
}

/** Legacy shims (period → month) */
export async function getResultsByPeriod(teamId: number, month: string) {
    return getResultsByMonth(teamId, month);
}
export async function getResultsByPeriodAndCategory(teamId: number, categoryId: number, month: string) {
    return getResultByCategoryAndMonth(teamId, categoryId, month);
}
