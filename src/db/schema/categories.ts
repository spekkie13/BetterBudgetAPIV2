import {AnyPgColumn, integer, pgTable, serial, varchar} from "drizzle-orm/pg-core";
import {teams} from "@/db/schema/teams";
import {categoryType} from "@/db/schema/_base";

export const categories = pgTable('category', {
    id: serial('id').primaryKey(),
    teamId: integer('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    type: categoryType('type').notNull().default('expense'),
    color: varchar('color', { length: 32 }).notNull(),
    icon: varchar('icon', { length: 64 }).notNull(),
    parentId: integer('parent_id').references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
});
