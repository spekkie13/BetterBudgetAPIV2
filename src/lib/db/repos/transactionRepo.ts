// lib/services/transaction/txRepo.ts
import { db } from '@/db/client';
import { txn, transactionSplits } from '@/db/schema';
import { and, or, desc, eq, gt, lt, gte, isNull, inArray, SQL } from 'drizzle-orm';

export async function selectById(teamId: number, id: number) {
    const rows = await db
        .select()
        .from(txn)
        .where(and(eq(txn.id, id), eq(txn.teamId, teamId), isNull(txn.deletedAt)))
        .limit(1);
    return rows[0] ?? null;
}

export async function selectAllNonTransfer(teamId: number) {
    return db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), eq(txn.isTransfer, false), isNull(txn.deletedAt)))
        .orderBy(desc(txn.postedAt), desc(txn.id));
}

export async function selectTransfersByPeriod(teamId: number | null, start: Date, end: Date) {
    const conds: (SQL | undefined)[] = [
        eq(txn.isTransfer, true),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        isNull(txn.deletedAt),
        teamId != null ? eq(txn.teamId, teamId) : undefined,
    ];
    return db.select().from(txn).where(and(...(conds.filter(Boolean) as SQL[]))).orderBy(desc(txn.postedAt), desc(txn.id));
}

export async function selectBaseByPeriodSign(teamId: number, start: Date, end: Date, sign?: 'pos'|'neg') {
    const conds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        eq(txn.isTransfer, false),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        sign === 'pos' ? gt(txn.amountCents, 0) : undefined,
        sign === 'neg' ? lt(txn.amountCents, 0) : undefined,
    ];
    return db.select().from(txn).where(and(...(conds.filter(Boolean) as SQL[]))).orderBy(desc(txn.postedAt), desc(txn.id));
}

export async function selectIdsByBaseCategory(teamId: number, start: Date, end: Date, categoryId: number, sign?: 'pos'|'neg') {
    const conds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        eq(txn.isTransfer, false),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        eq(txn.categoryId, categoryId),
        sign === 'pos' ? gt(txn.amountCents, 0) : undefined,
        sign === 'neg' ? lt(txn.amountCents, 0) : undefined,
    ];
    return db.select({ id: txn.id }).from(txn).where(and(...(conds.filter(Boolean) as SQL[])));
}

export async function selectIdsBySplitCategory(teamId: number, start: Date, end: Date, categoryId: number, sign?: 'pos'|'neg') {
    const conds: (SQL | undefined)[] = [
        eq(txn.teamId, teamId),
        eq(txn.isTransfer, false),
        isNull(txn.deletedAt),
        gte(txn.postedAt, start),
        lt(txn.postedAt, end),
        eq(transactionSplits.categoryId, categoryId),
        sign === 'pos' ? gt(transactionSplits.amountCents, 0) : undefined,
        sign === 'neg' ? lt(transactionSplits.amountCents, 0) : undefined,
    ];
    return db
        .select({ id: txn.id })
        .from(txn)
        .innerJoin(transactionSplits, eq(transactionSplits.txnId, txn.id))
        .where(and(...(conds.filter(Boolean) as SQL[])));
}

export async function selectByIdsOrdered(teamId: number, ids: number[]) {
    return db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), inArray(txn.id, ids), isNull(txn.deletedAt)))
        .orderBy(desc(txn.postedAt), desc(txn.id));
}

export async function selectSplitAwareByCategory(teamId: number, categoryId: number) {
    const rows = await db
        .select({ t: txn })
        .from(txn)
        .leftJoin(transactionSplits, eq(transactionSplits.txnId, txn.id))
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            or(eq(txn.categoryId, categoryId), eq(transactionSplits.categoryId, categoryId)),
        ))
        .orderBy(desc(txn.postedAt), desc(txn.id));
    return rows.map(r => r.t);
}

export async function insertTxn(values: Parameters<typeof db.insert<typeof txn>>[0] extends never ? never : any) {
    const [row] = await db.insert(txn).values(values).returning();
    return row;
}

export async function insertTxnReturningId(values: any) {
    const [row] = await db.insert(txn).values(values).returning({ id: txn.id });
    return row;
}

export async function insertSplits(rows: { txnId: number; categoryId: number; amountCents: number }[]) {
    if (!rows.length) return;
    await db.insert(transactionSplits).values(rows);
}

export async function tx<T>(fn: (conn: typeof db) => Promise<T>) {
    // Pass drizzle connection (transaction) to the callback
    // @ts-ignore drizzle types
    return db.transaction(async (conn: typeof db) => fn(conn));
}

export async function txInsertTxn(conn: typeof db, values: any, returningAll = true) {
    const q = conn.insert(txn).values(values);
    const rows = returningAll ? await q.returning() : await q.returning({ id: txn.id });
    return rows[0];
}

export async function txInsertSplits(conn: typeof db, rows: { txnId: number; categoryId: number; amountCents: number }[]) {
    if (!rows.length) return;
    await conn.insert(transactionSplits).values(rows);
}

export async function txUpdateTxn(conn: typeof db, id: number, patch: any) {
    const [row] = await conn.update(txn).set(patch).where(eq(txn.id, id)).returning();
    return row;
}

export async function txDeleteSplitsByTxn(conn: typeof db, txnId: number) {
    await conn.delete(transactionSplits).where(eq(transactionSplits.txnId, txnId));
}

export async function softDelete(teamId: number, id: number) {
    await db.update(txn).set({ deletedAt: new Date() }).where(and(eq(txn.id, id), eq(txn.teamId, teamId), isNull(txn.deletedAt)));
}
