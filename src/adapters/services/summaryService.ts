// services/summaryService.ts
import { db } from '@/db/client';
import { budgets, txn, transactionSplits, categories } from '@/db/schema';
import { and, eq, gte, lte, isNull, inArray } from 'drizzle-orm';

// ---------- helpers ----------
const toMonthStart = (month: string | Date): Date => {
    if (typeof month === 'string') return new Date(`${month}-01T00:00:00Z`); // "YYYY-MM"
    const y = month.getUTCFullYear();
    const m = month.getUTCMonth();
    return new Date(Date.UTC(y, m, 1));
};
const nextMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
const centsToMajor = (c: number) => Math.round(c) / 100;

// ---------- types ----------
export type CategorySummaryRow = {
    categoryId: number;
    // optional metadata if you want it in the UI
    categoryName?: string;
    categoryType?: 'expense' | 'income' | 'transfer';

    // amounts in MAJOR units (e.g., 123.45)
    budget: number;          // planned (>= 0)
    spent: number;           // sum of expenses (positive, abs)
    income: number;          // sum of incomes (positive)
    net: number;             // income - spent
    remaining: number;       // budget - spent
    percentSpent: number | null; // spent / budget * 100, null if budget === 0
};

// Aggregate cents for one category
type Acc = {
    budgetCents: number;
    spentCents: number;
    incomeCents: number;
};

// ---------- core ----------
export async function getMonthSummary(teamId: number, month: string | Date): Promise<CategorySummaryRow[]> {
    const start = toMonthStart(month);
    const end = nextMonth(start);

    // 1) Pull all budgets for this month
    const budgetRows = await db
        .select({
            categoryId: budgets.categoryId,
            periodMonth: budgets.periodMonth,
            amountCents: budgets.amountCents,
            rollover: budgets.rollover,
        })
        .from(budgets)
        .where(and(eq(budgets.teamId, teamId), eq(budgets.periodMonth, start.toISOString().slice(0, 10))));

    // 2) Pull all base transactions for the month (non-transfer, not deleted)
    const txRows = await db
        .select({
            id:      txn.id,
            teamId:  txn.teamId,
            amount:  txn.amountCents,
            catId:   txn.categoryId,
            posted:  txn.postedAt,
        })
        .from(txn)
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            gte(txn.postedAt, start),
            lte(txn.postedAt, end),
        ));

    const txIds = txRows.map(t => t.id);
    // 3) Pull splits for those transactions (if any)
    const splitRows = txIds.length
        ? await db
            .select({
                txnId: transactionSplits.txnId,
                categoryId: transactionSplits.categoryId,
                amount: transactionSplits.amountCents,
            })
            .from(transactionSplits)
            .where(inArray(transactionSplits.txnId, txIds))
        : [];

    // 4) Optional: category metadata (for friendly names/types)
    const catIds = new Set<number>();
    budgetRows.forEach(b => catIds.add(b.categoryId));
    txRows.forEach(t => { if (t.catId != null) catIds.add(t.catId); });
    splitRows.forEach(s => catIds.add(s.categoryId));

    const cats = catIds.size
        ? await db
            .select({
                id: categories.id,
                name: categories.name,
                type: categories.type,
            })
            .from(categories)
            .where(inArray(categories.id, Array.from(catIds)))
        : [];

    const catMeta = new Map<number, { name?: string; type?: 'expense'|'income'|'transfer' }>();
    for (const c of cats) catMeta.set(c.id, { name: c.name ?? undefined, type: c.type as any });

    // 5) Aggregate cents per category (split-aware)
    const acc = new Map<number, Acc>();

    const ensure = (categoryId: number) => {
        if (!acc.has(categoryId)) acc.set(categoryId, { budgetCents: 0, spentCents: 0, incomeCents: 0 });
        return acc.get(categoryId)!;
    };

    // apply budgets
    for (const b of budgetRows) {
        const a = ensure(b.categoryId);
        a.budgetCents += Number(b.amountCents);
    }

    // apply base transactions (ignore null categoryIds)
    for (const t of txRows) {
        if (t.catId == null) continue;
        const a = ensure(t.catId);
        const cents = Number(t.amount);
        if (cents >= 0) a.incomeCents += cents;
        else a.spentCents += Math.abs(cents);
    }

    // apply splits
    for (const s of splitRows) {
        const a = ensure(s.categoryId);
        const cents = Number(s.amount);
        if (cents >= 0) a.incomeCents += cents;
        else a.spentCents += Math.abs(cents);
    }

    // 6) Produce rows in major units
    const rows: CategorySummaryRow[] = [];
    for (const [categoryId, a] of acc.entries()) {
        const budgetMajor = centsToMajor(a.budgetCents);
        const spentMajor  = centsToMajor(a.spentCents);
        const incomeMajor = centsToMajor(a.incomeCents);
        const netMajor    = +(incomeMajor - spentMajor).toFixed(2);
        const remaining   = +(budgetMajor - spentMajor).toFixed(2);
        const percent     = budgetMajor > 0 ? +( (spentMajor / budgetMajor) * 100 ).toFixed(2) : null;

        const meta = catMeta.get(categoryId);

        rows.push({
            categoryId,
            categoryName: meta?.name,
            categoryType: meta?.type,
            budget: +budgetMajor.toFixed(2),
            spent: +spentMajor.toFixed(2),
            income: +incomeMajor.toFixed(2),
            net: netMajor,
            remaining,
            percentSpent: percent,
        });
    }

    // (optional) sort by category name or id for stable output
    rows.sort((a, b) => (a.categoryName ?? '').localeCompare(b.categoryName ?? '') || a.categoryId - b.categoryId);
    return rows;
}

export async function getCategorySummary(
    teamId: number,
    month: string | Date,
    categoryId: number
): Promise<CategorySummaryRow> {
    const all = await getMonthSummary(teamId, month);
    const row = all.find(r => r.categoryId === categoryId);
    // if the category had no activity and no budget, return an empty row with zeros
    if (row) return row;

    // still include metadata if category exists
    const catMeta = await db
        .select({ name: categories.name, type: categories.type })
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1);

    return {
        categoryId,
        categoryName: catMeta[0]?.name ?? undefined,
        categoryType: catMeta[0]?.type as any,
        budget: 0,
        spent: 0,
        income: 0,
        net: 0,
        remaining: 0,
        percentSpent: null,
    };
}
