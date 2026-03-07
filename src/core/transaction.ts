import {TransactionRequestDto, TransactionType} from "@/models";
import {isValueNull} from "@/core/http/requestHelpers";

export function parseTransactionBody(body: unknown): TransactionRequestDto | undefined {
    const payload = (body as any)?.data && typeof (body as any).data === "object" ? (body as any).data : body as Record<string, unknown>;

    if (!payload || typeof payload !== 'object') {
        throw new Error('Invalid request body');
    }

    if (!payload.transactionType) {
        throw new Error('Missing transactionType');
    }

    if (payload.transactionType === 'expense' && payload.categoryId <= 0) {
        throw new Error('Invalid Category ID');
    }

    const type = String(payload.transactionType).toLowerCase() as TransactionType;
    if (!['income', 'expense', 'transfer'].includes(type)) {
        throw new Error(`Unsupported transactionType: ${payload.transactionType}`);
    }

    const base = {
        accountId: Number(payload.accountId ?? payload.fromAccountID),
        amountCents: Number(payload.amountCents),
        currency: payload.currency ?? 'EUR',
        postedAt: payload.postedAt ?? payload.date ?? new Date().toISOString(),
        memo: payload.memo ?? payload.description ?? null,
        categoryId: isValueNull(payload.categoryId) ? null : Number(payload.categoryId),
        createdBy: isValueNull(payload.createdBy) ? null : Number(payload.createdBy),
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
                fromAccountId: Number(payload.fromAccountId ?? payload.fromAccountID),
                toAccountId: Number(payload.toAccountId ?? payload.toAccountID),
            };
    }
}

export interface TransactionCreateInput {
    teamId: number;
    accountId: number;
    amountCents: number;
    currency: string;
    postedAt: Date;
    memo?: string | null;
    categoryId?: number | null;
    createdBy?: number | null;
    transactionType: string;
    isTransfer?: boolean;
    fromAccountId?: number | null;
    toAccountId?: number | null;
}

export function mapToInsert(teamId: number, dto: TransactionRequestDto): TransactionCreateInput {
    return {
        teamId,
        accountId: dto.accountId,
        amountCents: dto.amountCents,
        currency: dto.currency,
        postedAt: new Date(dto.postedAt),
        memo: dto.memo ?? null,
        categoryId: dto.categoryId ?? null,
        createdBy: dto.createdBy ?? null,
        transactionType: dto.transactionType,
        isTransfer: dto.transactionType === TransactionType.Transfer,
        fromAccountId: 'fromAccountId' in dto ? dto.fromAccountId : null,
        toAccountId: 'toAccountId' in dto ? dto.toAccountId : null,
    };
}
