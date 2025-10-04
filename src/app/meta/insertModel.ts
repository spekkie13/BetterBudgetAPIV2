import {InferInsertModel} from "drizzle-orm";
import {accounts} from "@/db/schema/accounts";
import { budgets } from "@/db/schema/budgets";
import {categories} from "@/db/schema/categories";
import {memberships} from "@/db/schema/memberships";
import {teams} from "@/db/schema/teams";

export type AccountInsert = InferInsertModel<typeof accounts>;
export type BudgetInsert = InferInsertModel<typeof budgets>;
export type CategoryInsert = InferInsertModel<typeof categories>;
export type MembershipInsert = InferInsertModel<typeof memberships>;
export type TeamInsert = InferInsertModel<typeof teams>
