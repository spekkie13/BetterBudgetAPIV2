import {integer, pgTable, serial, varchar} from "drizzle-orm/pg-core";
import {periodStart} from "@/db/schema/_base";
import {teams} from "@/db/schema/teams";

export const team_settings = pgTable('team_settings', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    periodStart: periodStart('period_start').notNull().default('calendar_month'),
    anchor_day: integer('anchor_day').notNull().default(1),
    anchor_timezone: varchar('anchor_timezone').notNull().default('Europe/Amsterdam')
})
