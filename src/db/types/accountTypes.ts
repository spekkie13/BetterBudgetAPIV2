import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {accounts} from "@/db/schema";
import z from "zod";
import {zBoolish, zCurrency, zId, zName, zTeamId, zType50} from "@/db/types/common";

/** all db Account types */
export type AccountRow = InferSelectModel<typeof accounts>;
export type AccountInsert = InferInsertModel<typeof accounts>;
export type AccountPatch = Partial<Pick<AccountInsert, 'name' | 'type' | 'currency' | 'isArchived'>>;

export const AccountQuery = z.object({
    id: zId,
    teamId: zTeamId,
    includeArchived: zBoolish.default(false),
})
export type AccountQueryInput = z.infer<typeof AccountQuery>;

/** Parse route input to verify correctness */
export const AccountParams = z.object({ teamId: zTeamId, id: zId });

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
