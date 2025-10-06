import {bigint, boolean, integer, pgTable, serial, text, timestamp, varchar} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {accounts} from "@/db/schema/accounts";
import {categories} from "@/db/schema/categories";

export const recurringRules = pgTable('recurring_rule', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    accountId: integer('account_id').notNull().references(() => accounts.id, { onDelete: 'restrict' }),
    templateCategoryId: integer('template_category_id').references(() => categories.id, { onDelete: 'set null' }),
    templatePayee: varchar('template_payee', { length: 255 }),
    templateMemo: text('template_memo'),
    templateAmountCents: bigint('template_amount_cents', { mode: 'number' }).notNull(), // signed
    rrule: text('rrule').notNull(),
    nextRunAt: timestamp('next_run_at', { withTimezone: true }).notNull(),
    lastRunAt: timestamp('last_run_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
});
