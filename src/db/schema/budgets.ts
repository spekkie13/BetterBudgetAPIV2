import {bigint, boolean, date, index, integer, pgTable, serial, uniqueIndex} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {categories} from "@/db/schema/categories";

export const budgets = pgTable('budget', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    periodMonth: date('period_month').notNull(),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    rollover: boolean('rollover').notNull().default(false),
}, (t) => [
    uniqueIndex('ux_budget_team_cat_month').on(t.teamId, t.categoryId, t.periodMonth),
    index('ix_budget_team_month').on(t.teamId, t.periodMonth),
]);
