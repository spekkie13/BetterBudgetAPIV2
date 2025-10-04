import {InferSelectModel} from "drizzle-orm";
import {accounts, budgets, categories, memberships, teams} from "@/db/schema";

export type AccountRow = InferSelectModel<typeof accounts>;
export type BudgetRow = InferSelectModel<typeof budgets>;
export type CategoryRow = InferSelectModel<typeof categories>;
export type MembershipRow = InferSelectModel<typeof memberships>;
export type TeamRow = InferSelectModel<typeof teams>
