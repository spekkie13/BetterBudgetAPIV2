// lib/domain/budget.ts
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { budgets as budgetTbl } from '@/lib/db/schema';
import {monthToDate} from "@/lib/shared/helpers";

/** Persisted row (DB shape) */
export type BudgetRow = InferSelectModel<typeof budgetTbl>;
/** Insertable patch (DB shape) */
export type BudgetInsert = InferInsertModel<typeof budgetTbl>;

/** Unique key shape for a budget row */
export type BudgetKey = { teamId: number; categoryId: number; periodMonth: string };
export function makeBudgetKey(teamId: number, categoryId: number, month: string | Date): BudgetKey {
    return { teamId, categoryId, periodMonth: monthToDate(month) };
}
