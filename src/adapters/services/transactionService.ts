import {TeamScopedServiceBase} from "@/adapters/services/factory/teamScopedServiceBase";
import {TransactionInsert, TransactionPatch, TransactionRow} from "@/db/types/transactionTypes";
import {makeTransactionRepo} from "@/adapters/repo/transactionRepo";

export class TransactionService extends TeamScopedServiceBase<TransactionRow, number,  number, TransactionInsert, TransactionPatch> {
    constructor(){
        super(makeTransactionRepo());
    }

    async selectNonTransfers(teamId: number) {
        const transactions = await this.selectAllByTeam(teamId);
        return transactions.filter(
            (txn) => txn.isTransfer === false
        )
    }
}
