import {integer, pgTable, serial, text, timestamp, uniqueIndex} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {closingStatusEnum} from "@/db/schema/_base";
import {teams} from "@/db/schema/teams";

export const closing_runs = pgTable('closing_runs', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    dedupeKey: text('dedupe_key').notNull(), // bv. `${teamId}:${fromKey}`
    fromPeriodKey: text('from_period_key').notNull(),
    toPeriodKey: text('to_period_key').notNull(),
    status: closingStatusEnum('status').notNull().default('started'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
    uniqDedup: uniqueIndex('ux_closing_runs_dedupe').on(t.dedupeKey),
}));

export const closingRunsRelations = relations(closing_runs, ({ one }) => ({
    team: one(teams, { fields: [closing_runs.teamId], references: [teams.id] }),
}));
