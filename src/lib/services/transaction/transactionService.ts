// lib/services/transaction/txService.ts
import * as txRepo from '@/lib/db/repos/transactionRepo';
import * as categoryRepo from '@/lib/db/repos/categoryRepo';
import * as userRepo from '@/lib/db/repos/userRepo'

import { POS, NEG, toCentsStrict, toDateStrict } from './txUtils';
import type { Period, FilterKind, TxnKind, CreateTxnInput, CreateTransferInput, UpdateTxnInput } from './txTypes';

// ---------- READS ----------
export async function getTransactionById(teamId: number, id: number) {
    return txRepo.selectById(teamId, id);
}

export async function getAllTransactions(teamId: number) {
    return txRepo.selectAllNonTransfer(teamId);
}

export async function getTransactionsByTeamAndPeriod(teamId: number, period: Period, opts?: { type?: FilterKind; categoryId?: number },) {
    const type = opts?.type;
    const categoryId = opts?.categoryId;

    if (type === 'transfer') {
        return txRepo.selectTransfersByPeriod(teamId, period.startDate, period.endDate);
    }

    if (categoryId === undefined) {
        const sign = type === 'income' ? 'pos' : type === 'expense' ? 'neg' : undefined;
        return txRepo.selectBaseByPeriodSign(teamId, period.startDate, period.endDate, sign);
    }

    const sign = type === 'income' ? 'pos' : type === 'expense' ? 'neg' : undefined;
    const baseIds = await txRepo.selectIdsByBaseCategory(teamId, period.startDate, period.endDate, categoryId, sign);
    const splitIds = await txRepo.selectIdsBySplitCategory(teamId, period.startDate, period.endDate, categoryId, sign);
    const ids = Array.from(new Set([...baseIds.map(r => r.id), ...splitIds.map(r => r.id)]));
    if (!ids.length) return [];
    return txRepo.selectByIdsOrdered(teamId, ids);
}

export async function getTransactionsByPeriod(period: Period, opts?: { type?: FilterKind; categoryId?: number },) {
    const type = opts?.type;
    const categoryId = opts?.categoryId;

    if (type === 'transfer') {
        return txRepo.selectTransfersByPeriod(null, period.startDate, period.endDate);
    }

    if (categoryId !== undefined) {
        // Note: original used a leftJoin trick; we can keep repo-level equivalent if needed.
        // For now, reuse the team-agnostic pattern by not filtering team.
        // If you need team scoping here, extend inputs to include teamId.
        // (Kept behavior consistent with your original.)
        // Fallback to wide query by category would need a repo; omitted to match current usage scope.
        throw new Error('getTransactionsByPeriod with categoryId is not supported without team context');
    }

    const sign = type === 'income' ? 'pos' : type === 'expense' ? 'neg' : undefined;
    // teamId null means global; repo handles this via condition omission
    return txRepo.selectBaseByPeriodSign((null as unknown as number), period.startDate, period.endDate, sign);
}

export async function getTransactionsByCategory(teamId: number, categoryId: number) {
    return txRepo.selectSplitAwareByCategory(teamId, categoryId);
}

// ---------- CREATES ----------
export async function createTransaction(data: CreateTxnInput) {
    const postedAt = toDateStrict(data.date);
    const cents = toCentsStrict(data.amount);
    const kind: TxnKind = data.kind ?? (cents >= 0 ? 'income' : 'expense');
    const signedCents = kind === 'income' ? POS(cents) : NEG(cents);

    return txRepo.tx(async (conn) => {
        const currency = data.currency ?? (await userRepo.getCurrency(data.accountId));
        if (!currency) throw new Error('Account not found');

        const created = await txRepo.txInsertTxn(conn, {
            teamId: data.teamId,
            accountId: data.accountId,
            amountCents: signedCents,
            currency,
            postedAt,
            payee: data.payee ?? null,
            memo: data.description ?? null,
            categoryId: data.splits?.length ? null : (data.categoryId ?? null),
            isTransfer: false,
            createdBy: data.createdBy ?? null,
        });

        if (data.splits?.length) {
            const catIds = [...new Set(data.splits.map(s => s.categoryId))];
            await categoryRepo.ensureAllExistForTeam(data.teamId, catIds);

            const total = data.splits.reduce(
                (a, s) => a + (kind === 'income' ? POS(toCentsStrict(s.amount)) : NEG(toCentsStrict(s.amount))),
                0
            );
            if (Math.abs(total - signedCents) > 1) throw new Error('Sum of split amounts must equal total transaction amount.');

            await txRepo.txInsertSplits(conn, data.splits.map(s => ({
                txnId: created.id,
                categoryId: s.categoryId,
                amountCents: kind === 'income' ? POS(toCentsStrict(s.amount)) : NEG(toCentsStrict(s.amount)),
            })));
        }

        return created;
    });
}

export async function createExpense(args: Omit<CreateTxnInput, 'kind'>) {
    return createTransaction({ ...args, kind: 'expense' });
}

export async function createIncome(args: Omit<CreateTxnInput, 'kind'>) {
    return createTransaction({ ...args, kind: 'income' });
}

export async function createTransfer(data: CreateTransferInput) {
    const cents = POS(toCentsStrict(data.amount));
    const postedAt = toDateStrict(data.date);

    return txRepo.tx(async (conn) => {
        const fromCurrency = await userRepo.getCurrency(data.fromAccountId);
        const toCurrency = await userRepo.getCurrency(data.toAccountId);
        if (!fromCurrency || !toCurrency) throw new Error('Account not found');

        const outLeg = await txRepo.txInsertTxn(conn, {
            teamId: data.teamId,
            accountId: data.fromAccountId,
            amountCents: -cents,
            currency: fromCurrency,
            postedAt,
            memo: data.memo ?? 'Transfer',
            isTransfer: true,
            createdBy: data.createdBy ?? null,
        }, /*returningAll*/ false);

        const inLeg = await txRepo.txInsertTxn(conn, {
            teamId: data.teamId,
            accountId: data.toAccountId,
            amountCents: cents,
            currency: toCurrency,
            postedAt,
            memo: data.memo ?? 'Transfer',
            isTransfer: true,
            transferGroupId: outLeg.id,
            createdBy: data.createdBy ?? null,
        });

        await txRepo.txUpdateTxn(conn, outLeg.id, { transferGroupId: outLeg.id });

        return { outId: outLeg.id, inId: inLeg.id, transferGroupId: outLeg.id };
    });
}

// ---------- UPDATE / DELETE ----------
export async function updateTransaction(data: UpdateTxnInput) {
    return txRepo.tx(async (conn) => {
        const existing = await txRepo.txUpdateTxn(conn, data.id, {}); // quick fetch via returning no-op
        // If your dialect can't no-op return, replace with selectById team-guarded:
        // const existing = await txRepo.selectById(data.teamId, data.id);
        // and then skip this line above.
        if (!existing) throw new Error('Transaction not found');
        if (existing.isTransfer) throw new Error('Use transfer-specific update');

        const currentKind: TxnKind = existing.amountCents >= 0 ? 'income' : 'expense';
        const kind = data.kind ?? currentKind;

        const patch: Record<string, any> = {};
        if (data.amount !== undefined) {
            const cents = toCentsStrict(data.amount);
            patch.amountCents = kind === 'income' ? POS(cents) : NEG(cents);
        }
        if (data.date !== undefined) patch.postedAt = toDateStrict(data.date);
        if (data.accountId !== undefined) patch.accountId = data.accountId;
        if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
        if (data.payee !== undefined) patch.payee = data.payee;
        if (data.description !== undefined) patch.memo = data.description;

        const updated = Object.keys(patch).length
            ? await txRepo.txUpdateTxn(conn, data.id, patch)
            : existing;

        if (data.splits !== undefined) {
            await txRepo.txDeleteSplitsByTxn(conn, data.id);

            if (data.splits !== null && data.splits.length) {
                const catIds = [...new Set(data.splits.map(s => s.categoryId))];
                await categoryRepo.ensureAllExistForTeam(data.teamId, catIds);

                const total = data.splits.reduce(
                    (a, s) => a + (kind === 'income' ? POS(toCentsStrict(s.amount)) : NEG(toCentsStrict(s.amount))),
                    0
                );
                const baseCents = (patch.amountCents ?? existing.amountCents);
                if (Math.abs(total) !== Math.abs(baseCents)) {
                    throw new Error('Sum of split amounts must equal total transaction amount.');
                }

                await txRepo.txInsertSplits(conn, data.splits.map(s => ({
                    txnId: data.id,
                    categoryId: s.categoryId,
                    amountCents: kind === 'income' ? POS(toCentsStrict(s.amount)) : NEG(toCentsStrict(s.amount)),
                })));

                return await txRepo.txUpdateTxn(conn, data.id, { categoryId: null });
            }
        }

        return updated;
    });
}

export async function deleteTransactionById(teamId: number, id: number) {
    await txRepo.softDelete(teamId, id);
}
