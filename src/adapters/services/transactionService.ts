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

    async selectByType(teamId: number, type: string | null) {
        let transactions = await this.selectAllByTeam(teamId);
        switch (type) {
            case "transfer":
                transactions = transactions.filter(t => t.isTransfer === true);
                console.log(transactions);
                return transactions;
            case "income":
                transactions = transactions.filter(t => t.amountCents > 0 && t.isTransfer === false);
                return transactions;
            case "expense":
                transactions = transactions.filter(t => t.amountCents < 0 && t.isTransfer === false);
                return transactions;
            case "all":
            default:
                return transactions;
        }
    }
}
