import {TransactionPatch, TransactionRow} from "@/db/types/transactionTypes";
import {db} from "@/db/client";
import {txn} from "@/db/schema";
import {and, eq} from "drizzle-orm";
import {TransactionCreateInput} from "@/core/transaction";
import {ITransactionRepository} from "@/repository/interfaces/ITransactionRepository";

export class TransactionRepo implements ITransactionRepository {
    async create(transaction: TransactionCreateInput) : Promise<TransactionRow> {
        const [row] = await db
            .insert(txn)
            .values(transaction)
            .returning();

        return row;
    }

    async createMany(transactions: TransactionCreateInput[]): Promise<TransactionRow[]> {
        if (transactions.length === 0) return [];
        return db
            .insert(txn)
            .values(transactions)
            .onConflictDoNothing({ target: txn.importHash })
            .returning();
    }

    async selectIncomes(teamId: number) : Promise<TransactionRow[]> {
        const transactions = await this.selectByTeam(teamId);
        return transactions.filter(t => t.amountCents > 0);
    }

    async selectExpenses(teamId: number) : Promise<TransactionRow[]> {
        const transactions = await this.selectByTeam(teamId);
        return transactions.filter(t => t.amountCents < 0);
    }

    async selectById(teamId: number, id: number): Promise<TransactionRow> {
        const [row] = await db
            .select()
            .from(txn)
            .where(
                and(
                    eq(txn.teamId, teamId),
                    eq(txn.id, id)
                )
            )
            .limit(1);

        return row;
    }

    async selectByTeam(teamId: number): Promise<TransactionRow[]> {
        return await db
            .select()
            .from(txn)
            .where(eq(txn.teamId, teamId));
    }

    async selectTransfers(teamId: number): Promise<TransactionRow[]> {
        return await db
            .select()
            .from(txn)
            .where(
                and(
                    eq(txn.teamId, teamId),
                    eq(txn.isTransfer, true),
                )
            );
    }

    async updateById(teamId: number, id: number, transaction: TransactionPatch) : Promise<TransactionRow> {
        const [row] = await db
            .update(txn)
            .set(transaction)
            .where(
                and(
                    eq(txn.teamId, teamId),
                    eq(txn.id, id)
                )
            )
            .returning();

        return row;
    }

    async deleteById(teamId: number, id: number) : Promise<void> {
        await db
            .delete(txn)
            .where(
                and(
                    eq(txn.teamId, teamId),
                    eq(txn.id, id)
                )
            );
    }
}

export const transactionRepository = new TransactionRepo();
