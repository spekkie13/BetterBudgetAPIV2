// lib/services/budgetService.ts
import type { BudgetRow, BudgetInsert } from '@/lib/domain/budget';
import { makeBudgetKey } from '@/lib/domain/budget';
import * as repo from '@/lib/db/repos/budgetRepo';
import { toCents, monthToDate } from '@/lib/shared/helpers'

// =============== READS ===============
export async function getAllBudgets(teamId: number): Promise<BudgetRow[]> {
    return repo.selectAllByTeam(teamId);
}

export async function getBudgetById(teamId: number, id: number): Promise<BudgetRow | null> {
    return repo.selectById(teamId, id);
}

export async function getBudgetByMonthAndCategory(
    teamId: number,
    month: string | Date,
    categoryId: number
): Promise<BudgetRow | null> {
    return repo.selectByKey(makeBudgetKey(teamId, categoryId, month));
}

export async function getBudgetsByCategory(teamId: number, categoryId: number): Promise<BudgetRow[]> {
    return repo.selectByCategory(teamId, categoryId);
}

export async function getBudgetsByMonth(teamId: number, month: string | Date): Promise<BudgetRow[]> {
    return repo.selectByMonth(teamId, monthToDate(month));
}

// =============== WRITES ===============
export async function createBudget(data: {
    teamId: number;
    categoryId: number;
    month: string | Date;   // "YYYY-MM" or Date
    amount: number;         // major units
    rollover?: boolean;
}): Promise<BudgetRow> {
    const values: BudgetInsert = {
        teamId: data.teamId,
        categoryId: data.categoryId,
        periodMonth: monthToDate(data.month),
        amountCents: toCents(data.amount),
        rollover: data.rollover ?? false,
    };
    return repo.insert(values);
}

/** Update on (team_id, category_id, period_month) */
export async function updateBudget(data: {
    id: number;
    teamId: number;          // guard updates by team
    amount?: number;         // major units
    month?: string | Date;   // move to another month
    categoryId?: number;     // reassign category
    rollover?: boolean;
}): Promise<BudgetRow | null> {
    const patch: Partial<BudgetInsert> = {};
    if (data.amount !== undefined) patch.amountCents = toCents(data.amount);
    if (data.month !== undefined) patch.periodMonth = monthToDate(data.month);
    if (data.categoryId !== undefined) patch.categoryId = data.categoryId;
    if (data.rollover !== undefined) patch.rollover = data.rollover;

    // no-op fast path
    if (Object.keys(patch).length === 0) return repo.selectById(data.teamId, data.id);

    return repo.updateById(data.teamId, data.id, patch);
}

export async function deleteBudgetById(teamId: number, id: number): Promise<void> {
    await repo.deleteById(teamId, id);
}
