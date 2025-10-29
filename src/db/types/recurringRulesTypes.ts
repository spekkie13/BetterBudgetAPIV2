import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import z from "zod";
import {zBoolish, zCents, zId, zMaybeId, zName, zTeamId} from "@/db/types/common";
import {recurring_rules} from "@/db/schema/recurring_rules";

/** all db Recurring Rules types */
export type RecurringRulesRow = InferSelectModel<typeof recurring_rules>;
export type RecurringRulesInsert = InferInsertModel<typeof recurring_rules>;
export type RecurringRulesPatch = Partial<Pick<RecurringRulesInsert, 'categoryId' | 'name' | 'amountCents' | 'dayOfMonth' | 'active'>>;

export const RecurringRulesQuery = z.object({
    id: zMaybeId,
    teamId: zTeamId,
})
export type RecurringRulesQueryInput = z.infer<typeof RecurringRulesQuery>;

/** Parse route input to verify correctness */
export const RecurringRulesParams = z.object({ teamId: zTeamId, id: zMaybeId });

/** Collection query (?includeArchived=true|false) */
export const RecurringRulesBody = z.object({
    id: zId,
    teamId: zTeamId,
    categoryId: zId,
    name: zName,
    amountCents: zCents,
    dayOfMonth: z.number().int().min(1).max(31),
    active: zBoolish.default(true).optional(),
}).refine(
    (val) =>
        ['teamId', 'categoryId', 'name', 'amountCents', 'dayOfMonth', 'active'].some((k) =>
            Object.prototype.hasOwnProperty.call(val, k)
        ),
    { message: 'No fields to update' }
);
