import {TransactionPatch, TransactionRow} from "@/db/types/transactionTypes";
import {transactionRepository} from "@/repository/transactionRepo";
import {TransactionCreateInput} from "@/core/transaction";
import {BadRequestError} from "@/models/errors";
import {ITransactionRepository} from "@/repository/interfaces/ITransactionRepository";

type TypeQueryFn = (repo: ITransactionRepository, teamId: number) => Promise<TransactionRow[]>;

const typeQueryMap: Record<string, TypeQueryFn> = {
    income:   (repo, teamId) => repo.selectIncomes(teamId),
    expense:  (repo, teamId) => repo.selectExpenses(teamId),
    transfer: (repo, teamId) => repo.selectTransfers(teamId),
};

export class TransactionService {
    constructor(private readonly repo: ITransactionRepository) {}

    async selectTransactionsByType(teamId: number, type: string) : Promise<TransactionRow[]> {
        const query = typeQueryMap[type];
        if (!query)
            throw new BadRequestError('Invalid transaction type');

        return await query(this.repo, teamId);
    }

    async selectTransactionById(teamId: number, id: number) : Promise<TransactionRow> {
        return await this.repo.selectById(teamId, id);
    }

    async selectByTeam(teamId: number) : Promise<TransactionRow[]> {
        return await this.repo.selectByTeam(teamId);
    }

    async updateTransaction(teamId: number, id: number, transaction: TransactionPatch) : Promise<TransactionRow> {
        return await this.repo.updateById(teamId, id, transaction);
    }

    async deleteTransaction(teamId: number, id: number) : Promise<void> {
        await this.repo.deleteById(teamId, id);
    }

    async createTransaction(transaction: TransactionCreateInput) : Promise<TransactionRow> {
        return await this.repo.create(transaction);
    }

    async importTransactions(transactions: TransactionCreateInput[]): Promise<{ imported: number; deduped: number }> {
        const inserted = await this.repo.createMany(transactions);
        return {
            imported: inserted.length,
            deduped: transactions.length - inserted.length,
        };
    }
}

export const transactionService = new TransactionService(transactionRepository);
