import {boolean, bigint, index, integer, pgTable, serial, uniqueIndex, varchar} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {categories} from "@/db/schema/categories";

export const recurring_rules = pgTable('recurring_rules', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    categoryId: integer('category_id').notNull().references(() => categories.id),
    name: varchar('name', { length: 255 }).notNull(),
    amountCents: bigint('amount_cents', { mode: 'number' }).notNull(),
    dayOfMonth: integer('day_of_month'),
    active: boolean('active').notNull().default(true),
}, (t) => [
    uniqueIndex('ux_rule_team_name').on(t.teamId, t.name),
    index('ix_rule_team').on(t.teamId),
]);
