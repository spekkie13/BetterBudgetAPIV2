import { bigint, index, integer, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { teams } from "@/db/schema/teams";
import { categories } from "@/db/schema/categories";
import { periods } from "@/db/schema/periods";

export const results = pgTable('result', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    periodId: integer('period_id').notNull().references(() => periods.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
    budgetedCents: bigint('budgeted_cents', { mode: 'number' }).notNull().default(0),
    actualCents: bigint('actual_cents', { mode: 'number' }).notNull().default(0),
    carryoverCents: bigint('carryover_cents', { mode: 'number' }).notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('ux_result_period_category').on(t.periodId, t.categoryId),
    index('ix_result_team_period').on(t.teamId, t.periodId),
]);