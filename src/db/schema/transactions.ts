import {bigint, bigserial, boolean, index, integer, pgTable, text, timestamp, uniqueIndex, varchar} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {accounts} from "@/db/schema/accounts";
import {categories} from "@/db/schema/categories";
import {users} from "@/db/schema/users";

export const txn = pgTable('txn', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    currency: varchar('currency').notNull(),
    postedAt: timestamp('posted_at', { withTimezone: true }).notNull(),
    payee: varchar('payee', { length: 255 }),
    memo: text('memo'),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
    isTransfer: boolean('is_transfer').notNull().default(false),
    transferGroupId: bigint('transfer_group_id', { mode: 'number' }),
    createdBy: integer('created_by').references(() => users.id),
    importHash: varchar('import_hash', { length: 64 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (t) => [
    index('ix_txn_team_posted').on(t.teamId, t.postedAt),
    index('ix_txn_team_category').on(t.teamId, t.categoryId),
    index('ix_txn_team_account').on(t.teamId, t.accountId),
    index('ix_txn_transfer_group').on(t.transferGroupId),
    uniqueIndex('ux_txn_import_hash').on(t.importHash),
]);
