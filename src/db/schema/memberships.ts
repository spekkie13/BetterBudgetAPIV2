import {integer, pgTable, primaryKey, timestamp, varchar} from "drizzle-orm/pg-core";
import {users} from "@/db/schema/users";
import {teams} from "@/db/schema/teams";

export const memberships = pgTable('membership', {
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    role: varchar('role', { length: 50 }).default('member').notNull(),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
    primaryKey({ columns: [t.userId, t.teamId] })
]);
