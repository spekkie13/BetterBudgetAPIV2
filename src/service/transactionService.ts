import {TransactionPatch, TransactionRow} from "@/db/types/transactionTypes";
import {transactionRepository} from "@/repository/transactionRepo";
import {TransactionInsert} from "@/core/transaction";

export class TransactionService {
    async selectTransactionsByType(teamId: number, type: string) : Promise<TransactionRow[]> {
        return await transactionRepository.selectByType(teamId, type);
    }

    async selectTransactionById(teamId: number, id: number) : Promise<TransactionRow> {
        return await transactionRepository.selectById(teamId, id);
    }

    async selectByTeam(teamId: number) : Promise<TransactionRow[]> {
        return await transactionRepository.selectByTeam(teamId);
    }

    async updateTransaction(teamId: number, id: number, transaction: TransactionPatch) : Promise<TransactionRow> {
        return await transactionRepository.updateById(teamId, id, transaction);
    }

    async deleteTransaction(teamId: number, id: number) : Promise<void> {
        await transactionRepository.deleteById(teamId, id);
    }

    async createTransaction(transaction: TransactionInsert) : Promise<TransactionRow> {
        return await transactionRepository.create(transaction);
    }
}

export const transactionService = new TransactionService();
