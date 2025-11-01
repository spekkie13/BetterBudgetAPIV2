import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {accounts} from "@/db/schema";
import z from "zod";
import {zBoolish, zCurrency, zId, zMaybeId, zName, zTeamId, zType50} from "@/db/types/common";

/** all db Account types */
export type AccountRow = InferSelectModel<typeof accounts>;
export type AccountInsert = InferInsertModel<typeof accounts>;
export type AccountPatch = Partial<Pick<AccountInsert, 'name' | 'type' | 'currency' | 'isArchived'>>;

export const AccountQuery = z.object({
    id: zMaybeId,
    includeArchived: zBoolish.default(false).optional(),
})
export type AccountQueryInput = z.infer<typeof AccountQuery>;

/** Collection query (?includeArchived=true|false) */
export const AccountBody = z.object({
    id: zId,
    teamId: zTeamId,
    name: zName,
    type: zType50,
    currency: zCurrency,
    isArchived: zBoolish
}).refine(
    (val) =>
        ['teamId', 'name', 'type', 'currency', 'isArchived'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
    { message: 'No fields to update' }
);
