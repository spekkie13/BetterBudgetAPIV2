// services/transactionService.ts
import { db } from '@/lib/db/client';
import {
    transactions as txn,
    transactionSplits as splits,
    accounts,
    categories,
} from '@/lib/db/schema';
import {
    and, or, desc, eq, gt, lt, gte, lte, isNull, inArray,
} from 'drizzle-orm';

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────
const toCents = (amount: number | string) => Math.round(Number(amount) * 100);
const NEG = (cents: number) => (cents > 0 ? -cents : cents);
const POS = (cents: number) => (cents < 0 ? -cents : cents);

type Period = { startDate: Date; endDate: Date };
type SplitInput = { categoryId: number; amount: number | string };

type TxnKind = 'income' | 'expense';
type FilterKind = TxnKind | 'transfer';

async function getAccountCurrency(conn: typeof db, accountId: number) {
    const [acct] = await conn
        .select({ currency: accounts.currency })
        .from(accounts)
        .where(eq(accounts.id, accountId))
        .limit(1);
    return acct?.currency as any;
}

async function assertSplitCategoriesInTeam(
    conn: typeof db,
    teamId: number,
    catIds: number[],
) {
    if (!catIds.length) return;
    const rows = await conn
        .select({ id: categories.id })
        .from(categories)
        .where(and(eq(categories.teamId, teamId), inArray(categories.id, catIds)));
    if (rows.length !== catIds.length) {
        throw new Error('One or more split categories are invalid for this team.');
    }
}

// ───────────────────────────────────────────────────────────────────────────────
// Unified READS
// ───────────────────────────────────────────────────────────────────────────────

// Single transaction by id (non-deleted; any type)
export async function getTransactionById(teamId: number, id: number) {
    const rows = await db
        .select()
        .from(txn)
        .where(and(eq(txn.id, id), eq(txn.teamId, teamId), isNull(txn.deletedAt)))
        .limit(1);
    return rows[0] ?? null;
}

// All non-transfer, non-deleted (any sign)
export async function getAllTransactions(teamId: number) {
    return db
        .select()
        .from(txn)
        .where(and(eq(txn.teamId, teamId), eq(txn.isTransfer, false), isNull(txn.deletedAt)))
        .orderBy(desc(txn.postedAt), desc(txn.id));
}

/**
 * Get transactions in a period with optional filters
 * - type: 'income' -> amount > 0 (and not transfer)
 *         'expense' -> amount < 0 (and not transfer)
 *         'transfer' -> is_transfer = true
 * - categoryId: split-aware (matches base txn.category_id OR split.category_id)
 */
export async function getTransactionsByTeamAndPeriod(
    teamId: number,
    period: Period,
    opts?: { type?: FilterKind; categoryId?: number },
) {
    const type = opts?.type;
    const categoryId = opts?.categoryId;

    // Transfers ignore categories (no splits for transfers)
    if (type === 'transfer') {
        return db
            .select()
            .from(txn)
            .where(and(
                eq(txn.teamId, teamId),
                eq(txn.isTransfer, true),
                isNull(txn.deletedAt),
                gte(txn.postedAt, period.startDate),
                lt(txn.postedAt, period.endDate), // end exclusive
            ))
            .orderBy(desc(txn.postedAt), desc(txn.id));
    }

    // No category filter: simple sign filter on base txn
    if (categoryId === undefined) {
        const sign =
            type === 'income' ? gt(txn.amountCents, 0)
                : type === 'expense' ? lt(txn.amountCents, 0)
                    : undefined;

        return db
            .select()
            .from(txn)
            .where(and(
                eq(txn.teamId, teamId),
                eq(txn.isTransfer, false),
                isNull(txn.deletedAt),
                gte(txn.postedAt, period.startDate),
                lt(txn.postedAt, period.endDate),
                ...(sign ? [sign] : []),
            ))
            .orderBy(desc(txn.postedAt), desc(txn.id));
    }

    // ---- Category filter (split-aware) ----
    // Approach: fetch IDs from two sources and union in JS:
    // 1) base transactions where txn.category_id = categoryId (sign on txn)
    // 2) split lines where split.category_id = categoryId (sign on split)
    // Then fetch the final transactions by those IDs.

    // Sign predicates for base and splits depending on type
    const baseSign =
        type === 'income' ? gt(txn.amountCents, 0)
            : type === 'expense' ? lt(txn.amountCents, 0)
                : undefined;

    // For splits we need a join to filter by split sign
    const splitSign = (amountCol = splits.amountCents) =>
        type === 'income' ? gt(amountCol, 0)
            : type === 'expense' ? lt(amountCol, 0)
                : undefined;

    // 1) IDs from base category
    const baseRows = await db
        .select({ id: txn.id })
        .from(txn)
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            gte(txn.postedAt, period.startDate),
            lt(txn.postedAt, period.endDate),
            eq(txn.categoryId, categoryId),
            ...(baseSign ? [baseSign] : []),
        ));

    // 2) IDs from split category (join)
    const splitRows = await db
        .select({ id: txn.id })
        .from(txn)
        .innerJoin(splits, eq(splits.txnId, txn.id))
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            gte(txn.postedAt, period.startDate),
            lt(txn.postedAt, period.endDate),
            eq(splits.categoryId, categoryId),
            ...(splitSign() ? [splitSign()] : []),
        ));

    // Union the IDs
    const ids = Array.from(new Set([...baseRows.map(r => r.id), ...splitRows.map(r => r.id)]));
    if (ids.length === 0) return [];

    // Fetch the actual transactions by those IDs, ordered
    return db
        .select()
        .from(txn)
        .where(and(
            eq(txn.teamId, teamId),
            inArray(txn.id, ids),
            isNull(txn.deletedAt),
        ))
        .orderBy(desc(txn.postedAt), desc(txn.id));
}

export async function getTransactionsByPeriod(
    period: Period,
    opts?: { type?: FilterKind; categoryId?: number },
) {
    const type = opts?.type;
    const categoryId = opts?.categoryId;

    // Transfers ignore category (no category/splits for transfers)
    if (type === 'transfer') {
        return db
            .select()
            .from(txn)
            .where(and(
                eq(txn.isTransfer, true),
                gte(txn.postedAt, period.startDate),
                lte(txn.postedAt, period.endDate),
                isNull(txn.deletedAt),
            ))
            .orderBy(desc(txn.postedAt), desc(txn.id));
    }

    // If category filter present, use split-aware join
    if (categoryId !== undefined) {
        const rows = await db
            .select({ t: txn }) // select base txn row; we'll return r.t
            .from(txn)
            .leftJoin(splits, eq(splits.txnId, txn.id))
            .where(and(
                eq(txn.isTransfer, false),
                gte(txn.postedAt, period.startDate),
                lte(txn.postedAt, period.endDate),
                isNull(txn.deletedAt),
                // category match: either on base txn or split row
                or(eq(txn.categoryId, categoryId), eq(splits.categoryId, categoryId)),
                // sign filter if requested
                type === 'income'
                    ? or(gt(txn.amountCents, 0), gt(splits.amountCents, 0))
                    : type === 'expense'
                        ? or(lt(txn.amountCents, 0), lt(splits.amountCents, 0))
                        : // no type filter
                        or(gt(txn.amountCents, -Infinity as any), gt(splits.amountCents, -Infinity as any)), // always true; workaround for conditional
            ))
            .orderBy(desc(txn.postedAt), desc(txn.id));

        return rows.map(r => r.t);
    }

    // No category filter: simple non-transfer selection with optional sign filter
    const baseConds = [
        eq(txn.isTransfer, false),
        gte(txn.postedAt, period.startDate),
        lte(txn.postedAt, period.endDate),
        isNull(txn.deletedAt),
    ];

    if (type === 'income') {
        baseConds.push(gt(txn.amountCents, 0));
    } else if (type === 'expense') {
        baseConds.push(lt(txn.amountCents, 0));
    }

    return db
        .select()
        .from(txn)
        .where(and(...baseConds))
        .orderBy(desc(txn.postedAt), desc(txn.id));
}

// Split-aware by category (any sign, non-transfer)
export async function getTransactionsByCategory(teamId: number, categoryId: number) {
    const rows = await db
        .select({ t: txn })
        .from(txn)
        .leftJoin(splits, eq(splits.txnId, txn.id))
        .where(and(
            eq(txn.teamId, teamId),
            eq(txn.isTransfer, false),
            isNull(txn.deletedAt),
            or(eq(txn.categoryId, categoryId), eq(splits.categoryId, categoryId)),
        ))
        .orderBy(desc(txn.postedAt), desc(txn.id));

    return rows.map(r => r.t);
}

// ───────────────────────────────────────────────────────────────────────────────
// Unified CREATES (income or expense), plus transfer
// ───────────────────────────────────────────────────────────────────────────────

export async function createTransaction(data: {
    teamId: number;
    accountId: number;
    amount: number | string;          // major units
    date: Date | string;
    kind?: TxnKind;                   // if omitted: inferred from sign
    categoryId?: number | null;
    payee?: string | null;
    description?: string | null;
    createdBy?: number | null;
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD';
    splits?: SplitInput[];
}) {
    const postedAt = new Date(data.date);
    const cents = toCents(data.amount);
    const kind: TxnKind = data.kind ?? (cents >= 0 ? 'income' : 'expense');
    const signedCents = kind === 'income' ? POS(cents) : NEG(cents);

    return db.transaction(async (txConn: any) => {
        const currency = data.currency ?? (await getAccountCurrency(txConn, data.accountId));

        const [created] = await txConn
            .insert(txn)
            .values({
                teamId: data.teamId,
                accountId: data.accountId,
                amountCents: signedCents,
                currency: currency!,
                postedAt,
                payee: data.payee ?? null,
                memo: data.description ?? null,
                categoryId: data.splits?.length ? null : (data.categoryId ?? null),
                isTransfer: false,
                createdBy: data.createdBy ?? null,
            })
            .returning();

        if (data.splits?.length) {
            const catIds = [...new Set(data.splits.map(s => s.categoryId))];
            await assertSplitCategoriesInTeam(txConn, data.teamId, catIds);

            const total = data.splits.reduce(
                (a, s) => a + (kind === 'income' ? POS(toCents(s.amount)) : NEG(toCents(s.amount))),
                0
            );
            if (Math.abs(total - signedCents) > 1) {
                throw new Error('Sum of split amounts must equal total transaction amount.');
            }

            await txConn.insert(splits).values(
                data.splits.map(s => ({
                    txnId: created.id,
                    categoryId: s.categoryId,
                    amountCents: kind === 'income' ? POS(toCents(s.amount)) : NEG(toCents(s.amount)),
                }))
            );
        }

        return created;
    });
}

export async function createExpense(args: Omit<Parameters<typeof createTransaction>[0], 'kind'>) {
    return createTransaction({ ...args, kind: 'expense' });
}
export async function createIncome(args: Omit<Parameters<typeof createTransaction>[0], 'kind'>) {
    return createTransaction({ ...args, kind: 'income' });
}

export async function createTransfer(data: {
    teamId: number;
    fromAccountId: number;
    toAccountId: number;
    amount: number | string;  // major units
    date: Date | string;
    memo?: string;
    createdBy?: number | null;
}) {
    const cents = POS(toCents(data.amount));
    const postedAt = new Date(data.date);

    return db.transaction(async (txConn: any) => {
        const fromCurrency = await getAccountCurrency(txConn, data.fromAccountId);
        const toCurrency = await getAccountCurrency(txConn, data.toAccountId);

        const [outLeg] = await txConn.insert(txn).values({
            teamId: data.teamId,
            accountId: data.fromAccountId,
            amountCents: -cents,
            currency: fromCurrency!,
            postedAt,
            memo: data.memo ?? 'Transfer',
            isTransfer: true,
            createdBy: data.createdBy ?? null,
        }).returning({ id: txn.id });

        const transferGroupId = outLeg.id;

        const [inLeg] = await txConn.insert(txn).values({
            teamId: data.teamId,
            accountId: data.toAccountId,
            amountCents: cents,
            currency: toCurrency!,
            postedAt,
            memo: data.memo ?? 'Transfer',
            isTransfer: true,
            transferGroupId,
            createdBy: data.createdBy ?? null,
        }).returning();

        await txConn.update(txn).set({ transferGroupId }).where(eq(txn.id, outLeg.id));

        return { outId: outLeg.id, inId: inLeg.id, transferGroupId };
    });
}

// ───────────────────────────────────────────────────────────────────────────────
// Unified UPDATE + DELETE (soft)
// ───────────────────────────────────────────────────────────────────────────────

export async function updateTransaction(data: {
    id: number;
    teamId: number;
    amount?: number | string;      // major units; signed by kind
    kind?: 'income' | 'expense';
    date?: Date | string;
    accountId?: number;
    categoryId?: number | null;    // ignored if splits exist
    payee?: string | null;
    description?: string | null;
    splits?: { categoryId: number; amount: number | string }[] | null; // null => delete, undefined => leave
}) {
    return db.transaction(async (tx) => {
        const [existing] = await tx
            .select()
            .from(txn)
            .where(and(eq(txn.id, data.id), eq(txn.teamId, data.teamId), isNull(txn.deletedAt)))
            .limit(1);

        if (!existing) throw new Error('Transaction not found');
        if (existing.isTransfer) throw new Error('Use transfer-specific update');

        const currentKind: 'income' | 'expense' = existing.amountCents >= 0 ? 'income' : 'expense';
        const kind = data.kind ?? currentKind;

        // Build patch
        const patch: Record<string, any> = {};
        if (data.amount !== undefined) {
            const cents = toCents(data.amount);
            patch.amountCents = kind === 'income' ? POS(cents) : NEG(cents);
        }
        if (data.date !== undefined) patch.postedAt = new Date(data.date);
        if (data.accountId !== undefined) patch.accountId = data.accountId;
        if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
        if (data.payee !== undefined) patch.payee = data.payee;
        if (data.description !== undefined) patch.memo = data.description;

        // Only run the base update if we actually have something to set
        let [updated] = Object.keys(patch).length
            ? await tx.update(txn).set(patch).where(eq(txn.id, data.id)).returning()
            : [existing];

        // Splits handling
        if (data.splits !== undefined) {
            // wipe existing splits
            await tx.delete(splits).where(eq(splits.txnId, data.id));

            if (data.splits !== null && data.splits.length) {
                // (optional) team/category validation
                const catIds = [...new Set(data.splits.map(s => s.categoryId))];
                if (catIds.length) {
                    const valid = await tx
                        .select({ id: categories.id })
                        .from(categories)
                        .where(and(eq(categories.teamId, data.teamId), inArray(categories.id, catIds)));
                    if (valid.length !== catIds.length) {
                        throw new Error('One or more split categories are invalid for this team.');
                    }
                }

                // Compare ABS totals to avoid sign confusion
                const total = data.splits.reduce(
                    (a, s) => a + (kind === 'income' ? POS(toCents(s.amount)) : NEG(toCents(s.amount))),
                    0
                );
                const baseCents = (patch.amountCents ?? existing.amountCents);
                if (Math.abs(total) !== Math.abs(baseCents)) {
                    throw new Error('Sum of split amounts must equal total transaction amount.');
                }

                // insert splits
                await tx.insert(splits).values(
                    data.splits.map(s => ({
                        txnId: data.id,
                        categoryId: s.categoryId,
                        amountCents: kind === 'income' ? POS(toCents(s.amount)) : NEG(toCents(s.amount)),
                    }))
                );

                // null base category to avoid double counting; capture returned row
                [updated] = await tx.update(txn).set({ categoryId: null }).where(eq(txn.id, data.id)).returning();
            }
        }

        return updated;
    });
}

export async function deleteTransactionById(teamId: number, id: number) {
    await db
        .update(txn)
        .set({ deletedAt: new Date() })
        .where(and(eq(txn.id, id), eq(txn.teamId, teamId), isNull(txn.deletedAt)));
}
