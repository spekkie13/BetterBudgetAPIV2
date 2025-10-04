import {pgTable, serial, timestamp, varchar} from "drizzle-orm/pg-core";

export const teams = pgTable('team', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
