// lib/services/transaction/txTypes.ts
export type Period = { startDate: Date; endDate: Date };

export type TxnKind = 'income' | 'expense';
export type FilterKind = TxnKind | 'transfer';

// Splits in SIGNED cents (sum must equal txn.amountCents)
export type SplitInputCents = { categoryId: number; amountCents: number };

// Create (regular income/expense) in SIGNED cents
export type CreateTxnInputCents = {
    teamId: number;
    accountId: number;
    amountCents: number;               // expense < 0, income > 0
    postedAt: Date;
    categoryId?: number | null;        // null when splits are used
    payee?: string | null;
    memo?: string | null;
    createdBy?: number | null;
    createdAt: Date;
    updatedAt: Date;
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD'|string;
    splits?: SplitInputCents[];        // OPTIONAL; signed cents
};

// Update (regular) — partial; amounts/dates in cents semantics
export type UpdateTxnInputCents = {
    id: number;
    teamId: number;
    amountCents?: number;              // signed cents; if omitted, keep current
    postedAt?: Date;
    accountId?: number;
    categoryId?: number | null;        // null if moving to split-mode
    payee?: string | null;
    memo?: string | null;
    // If null => remove all splits; if [] => keep no splits; if provided => replace splits
    splits?: SplitInputCents[] | null;
};

// Transfer create — POSITIVE cents only; service writes two legs
export type CreateTransferInputCents = {
    teamId: number;
    fromAccountId: number;
    toAccountId: number;
    amountCents: number;               // must be > 0
    postedAt: Date;
    memo?: string | null;
    createdBy?: number | null;
    currency?: 'EUR'|'USD'|'GBP'|'JPY'|'CAD'|'AUD'|'NZD'|string;
};

