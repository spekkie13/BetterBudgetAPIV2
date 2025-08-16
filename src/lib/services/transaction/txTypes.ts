// lib/services/transaction/txTypes.ts
export type Period = { startDate: Date; endDate: Date };

export type TxnKind = 'income' | 'expense';
export type FilterKind = TxnKind | 'transfer';

export type SplitInput = { categoryId: number; amount: number | string };

export type CreateTxnInput = {
    teamId: number;
    accountId: number;
    amount: number | string;
    date: Date | string;
    kind?: TxnKind;
    categoryId?: number | null;
    payee?: string | null;
    description?: string | null;
    createdBy?: number | null;
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD';
    splits?: SplitInput[];
};

export type CreateTransferInput = {
    teamId: number;
    fromAccountId: number;
    toAccountId: number;
    amount: number | string;
    date: Date | string;
    memo?: string;
    createdBy?: number | null;
};

export type UpdateTxnInput = {
    id: number;
    teamId: number;
    amount?: number | string;
    kind?: TxnKind;
    date?: Date | string;
    accountId?: number;
    categoryId?: number | null;
    payee?: string | null;
    description?: string | null;
    splits?: { categoryId: number; amount: number | string }[] | null;
};
