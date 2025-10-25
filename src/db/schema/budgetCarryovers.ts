import { bigint, date, integer, pgTable, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { teams } from "@/db/schema/teams";
import { categories } from "@/db/schema/categories";

export const budgetCarryovers = pgTable(
    "budget_carryover",
    {
        teamId: integer("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
        categoryId: integer("category_id").notNull().references(() => categories.id, { onDelete: "cascade" }),
        fromMonth: date("from_month").notNull(),       // store "YYYY-MM-01"
        toMonth: date("to_month").notNull(),           // store "YYYY-MM-01"
        amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        primaryKey({ columns: [t.teamId, t.categoryId, t.fromMonth] }),
    ]
);
