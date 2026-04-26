import { date, index, integer, pgTable, serial, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { teams } from "@/db/schema/teams";
import { periodStart, periodStatusEnum, closingStatusEnum } from "@/db/schema/_base";

export const periods = pgTable('period', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: periodStatusEnum('status').notNull().default('open'),
    periodStartType: periodStart('period_start_type').notNull().default('calendar_month'),
    closingStatus: closingStatusEnum('closing_status'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    uniqueIndex('ux_period_team_start').on(t.teamId, t.startDate),
    index('ix_period_team_status').on(t.teamId, t.status),
]);