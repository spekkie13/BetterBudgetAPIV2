// lib/http/transactions/transactionRepo.ts
import { db } from '@/lib/db/client';
import { transactions as txn, transactionSplits as splits } from '@/lib/db/schema';
import { and, eq, gte, lt, desc, isNull, inArray, or, SQL } from 'drizzle-orm';

type BaseFilter = {
    teamId: number;
    start: Date;
    end: Date;
    cursor?: { postedAt: Date; id: number } | null;
    type?: 'income' | 'expense' | 'transfer';
};

function baseConds({ teamId, start, end, cursor, type }: BaseFilter): SQL[] {
    const conds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
    ];

    // transfer / sign filters
    if (type === 'transfer') {
        conds.push(eq(txn.isTransfer, true));
    } else {
        conds.push(eq(txn.isTransfer, false));
        if (type === 'expense') conds.push(lt(txn.amountCents, 0 as any));
        if (type === 'income')  conds.push(gte(txn.amountCents, 0 as any)); // >= 0 to include zeroes if you want
    }

    // compound keyset: (postedAt < c.postedAt) OR (postedAt = c.postedAt AND id < c.id)
    if (cursor) {
        conds.push(
            or(
                lt(txn.postedAt, cursor.postedAt),
                and(eq(txn.postedAt, cursor.postedAt), lt(txn.id, cursor.id))
            )
        );
    }

    return conds.filter(Boolean) as SQL[];
}

export async function getById(teamId: number, id: number) {
    const rows = await db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), eq(txn.id, id), isNull(txn.deletedAt)))
        .limit(1);
    return rows[0] ?? null;
}

export async function listBase(filter: BaseFilter, limit: number) {
    const items = await db
        .select()
        .from(txn)
        .where(and(...baseConds(filter)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit);

    const last = items.at(-1);
    const nextCursor = last ? { postedAt: last.postedAt, id: last.id } : null;
    return { items, nextCursor };
}

export async function listWithCategory(filter: BaseFilter & { categoryId: number }, limit: number) {
    // 1) base txn category matches
    const baseMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(txn)
        .where(and(...baseConds(filter), eq(txn.categoryId, filter.categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    // 2) split category matches
    const splitMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(splits)
        .innerJoin(txn, eq(splits.txnId, txn.id))
        .where(and(...baseConds(filter), eq(splits.categoryId, filter.categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    // 3) merge distinct by id, sort, slice
    const seen = new Set<number>();
    const merged = [...baseMatches, ...splitMatches]
        .filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)))
        .sort((a, b) => (b.postedAt.getTime() - a.postedAt.getTime()) || (b.id - a.id))
        .slice(0, limit);

    if (merged.length === 0) return { items: [], nextCursor: null };

    // 4) hydrate in stable order
    const ids = merged.map(m => m.id);
    const items = await db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, filter.teamId), inArray(txn.id, ids)))
        .orderBy(desc(txn.postedAt), desc(txn.id));

    const last = merged.at(-1)!;
    const nextCursor = { postedAt: last.postedAt, id: last.id };
    return { items, nextCursor };
}
