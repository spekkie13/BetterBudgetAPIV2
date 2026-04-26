import { TransactionPatch, TransactionRow } from '@/db/types/transactionTypes';
import { TransactionCreateInput } from '@/core/transaction';

export interface ITransactionRepository {
    create(transaction: TransactionCreateInput): Promise<TransactionRow>;
    createMany(transactions: TransactionCreateInput[]): Promise<TransactionRow[]>;
    selectIncomes(teamId: number): Promise<TransactionRow[]>;
    selectExpenses(teamId: number): Promise<TransactionRow[]>;
    selectTransfers(teamId: number): Promise<TransactionRow[]>;
    selectById(teamId: number, id: number): Promise<TransactionRow>;
    selectByTeam(teamId: number): Promise<TransactionRow[]>;
    updateById(teamId: number, id: number, transaction: TransactionPatch): Promise<TransactionRow>;
    deleteById(teamId: number, id: number): Promise<void>;
}
