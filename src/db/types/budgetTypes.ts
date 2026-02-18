import {InferInsertModel, InferSelectModel} from "drizzle-orm";
import {budgets} from "@/db/schema";
import { z } from 'zod';
import {zBoolish, zCents, zId, zMaybeId, zMonth } from "@/db/types/common";
import {monthToDate} from "@/core/date";

/** all db Budget types*/
export type BudgetRow = InferSelectModel<typeof budgets>;
export type BudgetInsert = InferInsertModel<typeof budgets>;
export type BudgetPatch = Partial<Pick<BudgetInsert, 'categoryId' | 'periodMonth' | 'amountCents' | 'rollover'>>;

export const BudgetQuery = z.object({
    categoryId: zMaybeId,
    periodMonth: zMonth,
})
export type BudgetQueryInput = z.infer<typeof BudgetQuery>;

/** create a composite budget key object */
export type BudgetKey = { teamId: number; categoryId: number; periodMonth: string };
export function makeBudgetKey(teamId: number, categoryId: number, month: string | Date): BudgetKey {
    return { teamId, categoryId, periodMonth: monthToDate(month) };
}

/** Parse route input to verify correctness */
export const BudgetParams = z.object({ id: zId });
export type BudgetParamsInput = z.infer<typeof BudgetParams>;

/** Collection query */
export const BudgetBody = z.object({
    categoryId: zId,
    periodMonth: zMonth,
    amountCents: zCents,
    rollover: zBoolish.default(false),
});
