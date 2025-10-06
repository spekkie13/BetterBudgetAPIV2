import {boolean, index, integer, pgTable, serial, uniqueIndex, varchar} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {currencyCode} from "@/db/schema/_base";

export const accounts = pgTable('account', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).notNull(), // 'bank' | 'cash' | 'credit' | ...
    currency: currencyCode('currency').notNull().default('EUR'),
    isArchived: boolean('is_archived').notNull().default(false),
}, (t) => [
    uniqueIndex('ux_account_team_name').on(t.teamId, t.name),
    index('ix_account_team').on(t.teamId),
]);
