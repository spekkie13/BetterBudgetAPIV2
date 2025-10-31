import {pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";

export const users = pgTable('app_user', {
    id: serial('id').primaryKey(),
    supabaseUid: varchar('supabase_uid', { length: 128 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
