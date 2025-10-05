import { db } from '@/db/client';
import { txn, transactionSplits } from '@/db/schema';
import { and, eq, gte, lt, desc, isNull, inArray, or, SQL } from 'drizzle-orm';

type TypeFilter = 'income' | 'expense' | 'transfer';

type BaseFilter = {
    teamId: number;
    start?: Date; // undefined => all-time
    end?: Date;   // undefined => all-time
    cursor?: { postedAt?: Date; id?: number } | null;
    type?: TypeFilter;
    accountId?: number;
};

type ListArgs = BaseFilter & {
    categoryId?: number;
};

export async function getById(teamId: number, id: number) {
    const rows = await db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), eq(txn.id, id), isNull(txn.deletedAt)))
        .limit(1);
    return rows[0] ?? null;
}

function baseConditions({ teamId, start, end, cursor, type, accountId }: BaseFilter): SQL[] {
    const conditions: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        isNull(txn.deletedAt),
        start ? gte(txn.postedAt, start) : undefined,
        end   ? lt(txn.postedAt, end)    : undefined,
    ];

    // Transfer / sign filters op parent txn
    if (type === 'transfer') {
        conditions.push(eq(txn.isTransfer, true));
    } else if (type === 'expense') {
        conditions.push(eq(txn.isTransfer, false));
        conditions.push(lt(txn.amountCents, 0 as any));
    } else if (type === 'income') {
        conditions.push(eq(txn.isTransfer, false));
        conditions.push(gte(txn.amountCents, 0 as any));
    } else {
        // show all
    }

    if (accountId !== undefined) {
        conditions.push(eq(txn.accountId, accountId));
    }

    if (cursor?.postedAt || cursor?.id) {
        const cDate = cursor.postedAt ?? new Date(8640000000000000); // far future fallback
        const cId = cursor.id ?? Number.MAX_SAFE_INTEGER;
        conditions.push(
            or(
                lt(txn.postedAt, cDate),
                and(eq(txn.postedAt, cDate), lt(txn.id, cId))
            )
        );
    }

    return conditions.filter(Boolean) as SQL[];
}

export async function list(args: ListArgs, limit: number): Promise<{ items: any[]; nextCursor: { postedAt: Date; id: number } | null; }> {
    const { categoryId, ...base } = args;

    if (categoryId === undefined) {
        const items = await db
            .select()
            .from(txn)
            .where(and(...baseConditions(base)))
            .orderBy(desc(txn.postedAt), desc(txn.id))
            .limit(limit + 1);

        let nextCursor = null as { postedAt: Date; id: number } | null;
        let sliced = items;

        if (items.length > limit) {
            const last = items[limit - 1];
            nextCursor = { postedAt: last.postedAt, id: last.id };
            sliced = items.slice(0, limit);
        }

        return { items: sliced, nextCursor };
    }

    const baseMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(txn)
        .where(and(...baseConditions(base), eq(txn.categoryId, categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    const splitMatches = await db
        .select({ id: txn.id, postedAt: txn.postedAt })
        .from(transactionSplits)
        .innerJoin(txn, eq(transactionSplits.txnId, txn.id))
        .where(and(...baseConditions(base), eq(transactionSplits.categoryId, categoryId)))
        .orderBy(desc(txn.postedAt), desc(txn.id))
        .limit(limit * 2);

    // 3) merge distinct by id, sort desc, slice limit
    const seen = new Set<number>();
    const merged = [...baseMatches, ...splitMatches]
        .filter(r => (seen.has(r.id) ? false : (seen.add(r.id), true)))
        .sort((a, b) =>
            (b.postedAt.getTime() - a.postedAt.getTime()) || (b.id - a.id)
        )
        .slice(0, limit);

    if (merged.length === 0) {
        return { items: [], nextCursor: null };
    }

    const ids = merged.map(m => m.id);
    const items = await db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, base.teamId), inArray(txn.id, ids), isNull(txn.deletedAt)))
        .orderBy(desc(txn.postedAt), desc(txn.id));

    const last = merged.at(-1)!;
    const nextCursor = { postedAt: last.postedAt, id: last.id };

    return { items, nextCursor };
}
