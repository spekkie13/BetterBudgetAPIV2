export enum TransactionType {
    Expense = 'expense',
    Income = 'income',
    Transfer = 'transfer',
}

export interface TransactionRequestBaseDto {
    accountId: number;
    amountCents: number;
    currency: string;         // 'EUR'
    postedAt: string;         // ISO
    memo?: string | null;
    categoryId?: number | null;
    createdBy?: number | null;
    transactionType: TransactionType;
}

export interface IncomeRequestDto extends TransactionRequestBaseDto {
    transactionType: TransactionType.Income;
}

export interface ExpenseRequestDto extends TransactionRequestBaseDto {
    transactionType: TransactionType.Expense;
}

export interface TransferRequestDto extends TransactionRequestBaseDto {
    transactionType: TransactionType.Transfer;
    fromAccountId: number;
    toAccountId: number;
}

export type TransactionRequestDto =
    | IncomeRequestDto
    | ExpenseRequestDto
    | TransferRequestDto;

export interface TransactionResponseBaseDto
    extends TransactionRequestBaseDto {
    id: number;
    teamId: number;
    createdAt: string;
    updatedAt: string;
}

export interface IncomeResponseDto extends TransactionResponseBaseDto {
    transactionType: TransactionType.Income;
}

export interface ExpenseResponseDto extends TransactionResponseBaseDto {
    transactionType: TransactionType.Expense;
}

export interface TransferResponseDto extends TransactionResponseBaseDto {
    transactionType: TransactionType.Transfer;
    fromAccountId: number;
    toAccountId: number;
}

export type TransactionResponseDto =
    | IncomeResponseDto
    | ExpenseResponseDto
    | TransferResponseDto;
