import {integer, jsonb, pgTable, varchar} from "drizzle-orm/pg-core";
import {users} from "@/db/schema/users";

export const userSettings = pgTable('user_setting', {
    userId: integer('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
    theme: varchar('theme', { length: 20 }).default('system'),
    textSize: varchar('text_size', { length: 10 }).default('M'),
    preferences: jsonb('preferences').$type<Record<string, unknown>>(), // extras
});
