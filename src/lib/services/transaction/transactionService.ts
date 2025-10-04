// lib/services/transaction/txService.ts
import * as txRepo from '@/lib/db/repos/transactionRepo';
import * as userRepo from '@/lib/db/repos/userRepo';

import { toDateStrict } from './txUtils';
import type {
    CreateTxnInputCents,
    CreateTransferInputCents,
    UpdateTxnInputCents,
    SplitInputCents,
} from './txTypes';
import {exists} from "@/lib/services/category/categoryService";

// ---------- READS ----------
export async function getTransactionById(teamId: number, id: number) {
    return txRepo.selectById(teamId, id);
}

// ---------- CREATES (REGULAR) ----------
export async function createTransaction(data: CreateTxnInputCents) {
    const postedAt = toDateStrict(data.postedAt);
    const cents = toIntStrict(data.amountCents); // already signed cents

    return txRepo.tx(async (conn) => {
        const currency = data.currency ?? (await userRepo.getCurrency(data.accountId)) ?? 'EUR'
        if (!currency) throw new Error('Account not found');

        // If splits provided, categoryId on the base txn must be null
        const created = await txRepo.txInsertTxn(conn, {
            teamId: data.teamId,
            accountId: data.accountId,
            amountCents: cents, // signed cents as-is
            currency,
            postedAt,
            payee: data.payee ?? null,
            memo: data.memo ?? null,
            categoryId: data.splits?.length ? null : (data.categoryId ?? null),
            isTransfer: false,
            createdBy: data.createdBy ?? null,
            createdAt: data.createdAt
        });

        if (data.splits?.length) {
            await checkSplitsSignedCents(data.teamId, data.splits, cents);
            await txRepo.txInsertSplits(
                conn,
                data.splits.map((s) => ({
                    txnId: created.id,
                    categoryId: s.categoryId,
                    amountCents: toIntStrict(s.amountCents), // signed cents
                })),
            );
        }

        return created;
    });
}

// ---------- CREATES (TRANSFER) ----------
export async function createTransfer(data: CreateTransferInputCents) {
    const postedAt = toDateStrict(data.postedAt);
    const amount = toIntStrict(data.amountCents);
    if (amount <= 0) throw new Error('Transfer amountCents must be > 0');
    if (data.fromAccountId === data.toAccountId) {
        throw new Error('fromAccountId and toAccountId must differ');
    }

    return txRepo.tx(async (conn) => {
        const fromCurrency = data.currency ?? (await userRepo.getCurrency(data.fromAccountId));
        const toCurrency = data.currency ?? (await userRepo.getCurrency(data.toAccountId));
        if (!fromCurrency || !toCurrency) throw new Error('Account not found');

        if (fromCurrency !== toCurrency) {
            // If you don’t support FX transfers, block them:
            throw new Error('Cross-currency transfers are not supported');
        }

        // Use first leg id as transferGroupId, or use a repo helper to get a sequence
        const outLeg = await txRepo.txInsertTxn(
            conn,
            {
                teamId: data.teamId,
                accountId: data.fromAccountId,
                amountCents: -amount, // outflow
                currency: fromCurrency,
                postedAt,
                payee: null,
                memo: data.memo ?? 'Transfer',
                categoryId: null,
                isTransfer: true,
                createdBy: data.createdBy ?? null,
            },
            /* returningAll */ false,
        );

        const inLeg = await txRepo.txInsertTxn(conn, {
            teamId: data.teamId,
            accountId: data.toAccountId,
            amountCents: amount, // inflow
            currency: toCurrency,
            postedAt,
            payee: null,
            memo: data.memo ?? 'Transfer',
            categoryId: null,
            isTransfer: true,
            transferGroupId: outLeg.id,
            createdBy: data.createdBy ?? null,
        });

        await txRepo.txUpdateTxn(conn, outLeg.id, { transferGroupId: outLeg.id });

        return { outId: outLeg.id, inId: inLeg.id, transferGroupId: outLeg.id, inTxn: inLeg };
    });
}

// ---------- UPDATE / DELETE ----------
export async function updateTransaction(data: UpdateTxnInputCents) {
    return txRepo.tx(async (conn) => {
        // Fetch existing to validate/derive defaults
        const existing = await txRepo.selectById(data.teamId, data.id);
        if (!existing) throw new Error('Transaction not found');
        if (existing.isTransfer) throw new Error('Use transfer-specific update');

        const patch: Record<string, any> = {};

        if (data.amountCents !== undefined) {
            patch.amountCents = toIntStrict(data.amountCents); // signed cents as given
        }
        if (data.postedAt !== undefined) {
            patch.postedAt = toDateStrict(data.postedAt);
        }
        if (data.accountId !== undefined) patch.accountId = data.accountId;
        if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
        if (data.payee !== undefined) patch.payee = data.payee;
        if (data.memo !== undefined) patch.memo = data.memo;

        const updated = Object.keys(patch).length
            ? await txRepo.txUpdateTxn(conn, data.id, patch)
            : existing;

        // Handle splits replacement logic
        if (data.splits !== undefined) {
            await txRepo.txDeleteSplitsByTxn(conn, data.id);

            if (data.splits !== null && data.splits.length) {
                const total = data.amountCents !== undefined ? toIntStrict(data.amountCents) : updated.amountCents;
                await checkSplitsSignedCents(data.teamId, data.splits, total);

                await txRepo.txInsertSplits(
                    conn,
                    data.splits.map((s) => ({
                        txnId: data.id,
                        categoryId: s.categoryId,
                        amountCents: toIntStrict(s.amountCents), // signed cents
                    })),
                );

                // When splits exist, base category must be null
                return await txRepo.txUpdateTxn(conn, data.id, { categoryId: null });
            }
        }

        return updated;
    });
}

export async function deleteTransactionById(teamId: number, id: number) {
    await txRepo.softDelete(teamId, id);
}

// ---------- HELPERS ----------
function toIntStrict(n: unknown): number {
    const v = Number(n);
    if (!Number.isFinite(v)) throw new Error('Invalid integer');
    // cents can be any finite integer; if you want to enforce integer-ness:
    if (!Number.isInteger(v)) throw new Error('Invalid integer (non-integer cents)');
    return v;
}

async function checkSplitsSignedCents(
    teamId: number,
    splits: SplitInputCents[] = [],
    totalSignedCents: number,
) {
    const catIds = [...new Set(splits.map((s) => s.categoryId))];
    for(let id of catIds) {
        await exists(teamId, id);
    }

    const sum = splits.reduce((a, s) => a + toIntStrict(s.amountCents), 0);
    if (sum !== totalSignedCents) {
        throw new Error('Sum of split amountCents must equal total amountCents.');
    }
}
