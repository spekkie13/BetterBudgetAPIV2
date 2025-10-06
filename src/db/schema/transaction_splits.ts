import {bigint, index, integer, pgTable, serial} from "drizzle-orm/pg-core";
import {categories} from "@/db/schema/categories";
import {txn} from "@/db/schema/transactions";

export const transactionSplits = pgTable('txn_split', {
    id: serial('id').primaryKey(),
    txnId: bigint('txn_id', { mode: 'number' }).notNull().references(() => txn.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
}, (t) => [
    index('ix_split_txn').on(t.txnId),
]);
