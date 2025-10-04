import {date, integer, pgTable, serial, text, timestamp, uniqueIndex} from "drizzle-orm/pg-core";
import {periodStatusEnum} from "@/db/schema/_base";
import {relations} from "drizzle-orm";
import {teams} from "@/db/schema/teams";

export const periods = pgTable('periods', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    year: integer('year').notNull(),
    month: integer('month').notNull(),
    startDate: date('start_date').notNull(),
    endDate: timestamp('end_date', { withTimezone: true }).notNull(),
    status: periodStatusEnum('status').notNull().default('open'),
}, (t) => ({
    uniqKey: uniqueIndex('ux_periods_team_key').on(t.teamId, t.key),
}));

export const periodsRelations = relations(periods, ({ one }) => ({
    team: one(teams, { fields: [periods.teamId], references: [teams.id] }),
}));
