import {TransactionRequestDto, TransactionType} from "@/models/transaction";
import {isValueNull} from "@/core/http/requestHelpers";

export function parseTransactionBody(body: any): TransactionRequestDto | undefined {
    if (!body || typeof body !== 'object') {
        throw new Error('Invalid request body');
    }

    if (!body.transactionType) {
        throw new Error('Missing transactionType');
    }

    if (body.transactionType === 'expense' && body.categoryId <= 0) {
        throw new Error('Invalid Category ID');
    }

    const type = String(body.transactionType).toLowerCase() as TransactionType;
    if (!['income', 'expense', 'transfer'].includes(type)) {
        throw new Error(`Unsupported transactionType: ${body.transactionType}`);
    }

    const base = {
        accountId: Number(body.accountId ?? body.fromAccountID),
        amountCents: Number(body.amountCents),
        currency: body.currency ?? 'EUR',
        postedAt: body.postedAt ?? body.date ?? new Date().toISOString(),
        memo: body.memo ?? body.description ?? null,
        categoryId: isValueNull(body.categoryId) ? null : Number(body.categoryId),
        createdBy: isValueNull(body.createdBy) ? null : Number(body.createdBy),
        transactionType: type,
    } as const;

    switch (type) {
        case 'income':
            return {
                ...base,
                transactionType: TransactionType.Income,
                accountId: base.accountId,
            };
        case 'expense':
            return { ...base, transactionType: TransactionType.Expense };
        case 'transfer':
            return {
                ...base,
                transactionType: TransactionType.Transfer,
                fromAccountId: Number(body.fromAccountId ?? body.fromAccountID),
                toAccountId: Number(body.toAccountId ?? body.toAccountID),
            };
    }
}

export interface TransactionInsert {
    teamId: number;
    accountId: number;
    amountCents: number;
    currency: string;
    postedAt: Date;
    memo?: string | null;
    categoryId?: number | null;
    createdBy?: number | null;
    transactionType: string;
    fromAccountId?: number | null;
    toAccountId?: number | null;
}

export function mapToInsert(
    teamId: number,
    dto: TransactionRequestDto
): TransactionInsert | undefined {
    const base: TransactionInsert = {
        teamId,
        accountId: dto.accountId,
        amountCents: dto.amountCents,
        currency: dto.currency,
        postedAt: new Date(dto.postedAt),
        memo: dto.memo ?? null,
        categoryId: dto.categoryId ?? null,
        createdBy: dto.createdBy ?? null,
        transactionType: dto.transactionType,
    };

    switch (dto.transactionType) {
        case 'income':
            return base;
        case 'expense':
            return base;
        case 'transfer':
            return {
                ...base,
                fromAccountId: dto.fromAccountId ?? null,
                toAccountId: dto.toAccountId ?? null,
            };
    }
}
