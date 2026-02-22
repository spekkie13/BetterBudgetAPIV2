import {TransactionPatch, TransactionRow} from "@/db/types/transactionTypes";
import {db} from "@/db/client";
import {txn} from "@/db/schema";
import {and, eq} from "drizzle-orm";
import {TransactionInsert} from "@/core/transaction";
import {TransactionNotFoundError} from "@/models/errors";

export class TransactionRepo {
    async create(transaction: TransactionInsert) : Promise<TransactionRow> {
        const [row] = await db
            .insert(txn)
            .values(transaction)
            .returning();

        return row;
    }

    async selectByType(teamId: number, type: string) : Promise<TransactionRow[]> {
        const rows = await db
            .select()
            .from(txn)
            .where(
                and(
                    eq(txn.teamId, teamId),
                )
            );

        console.log(type);
        if (rows.length === 0) {
            throw new TransactionNotFoundError(teamId);
        }

        return rows;
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
        const rows = await db
            .select()
            .from(txn)
            .where(
                eq(txn.teamId, teamId),
            );

        if (rows.length === 0) {
            throw new TransactionNotFoundError(teamId);
        }

        return rows;
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
