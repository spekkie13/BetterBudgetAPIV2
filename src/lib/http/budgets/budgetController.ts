import * as budgetService from '@/lib/services/budget/budgetService';
import {
    getBudgetById,
    getBudgetByMonthAndCategory,
    getBudgetsByCategory,
    getBudgetsByMonth,
    getAllBudgets,
} from '@/lib/services/budget/budgetService';
import { BudgetQueryInput, CreateBudgetBody } from './budgetSchemas';
import { HttpResult, toHttpResult} from '@/lib/http/shared/errors';
import {
    DeleteBudgetQuery,
    UpdateBudgetBody,
    UpdateBudgetQuery
} from "@/lib/http/budgets/budgetMutateSchemas";

export async function getBudgetsController(q: BudgetQueryInput): Promise<HttpResult> {
    try {
        const { teamId, budgetId, categoryId, month } = q;

        // 1) /api/budgets?teamId=1&budgetId=123
        if (budgetId !== undefined) {
            const budget = await getBudgetById(teamId, budgetId);
            return { status: 200, body: budget ?? {} };
        }

        // 2) /api/budgets?teamId=1&categoryId=2&month=YYYY-MM
        if (categoryId !== undefined && month) {
            const budget = await getBudgetByMonthAndCategory(teamId, month, categoryId);
            return { status: 200, body: budget ?? {} };
        }

        // 3) /api/budgets?teamId=1&categoryId=2
        if (categoryId !== undefined) {
            const rows = await getBudgetsByCategory(teamId, categoryId);
            return { status: 200, body: rows };
        }

        // 4) /api/budgets?teamId=1&month=YYYY-MM
        if (month) {
            const rows = await getBudgetsByMonth(teamId, month);
            return { status: 200, body: rows };
        }

        // 5) /api/budgets?teamId=1
        const rows = await getAllBudgets(teamId);
        return { status: 200, body: rows };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function createBudgetController(body: unknown): Promise<HttpResult> {
    try {
        const parsed = CreateBudgetBody.safeParse(body);

        if (!parsed.success) {
            return { status: 400, body: { error: 'Invalid body' } };
        }

        const { teamId, categoryId, month, amount, rollover } = parsed.data;

        const created = await budgetService.createBudget({
            teamId,
            categoryId,
            month,
            amount,
            rollover
        })
        return { status: 201, body: created };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function updateBudgetController(query: URLSearchParams, body: unknown): Promise<HttpResult> {
    try {
        const q = UpdateBudgetQuery.safeParse(Object.fromEntries(query.entries()));
        if (!q.success) return { status: 400, body: { error: 'Must provide a valid id' } };

        const b = UpdateBudgetBody.safeParse(body);
        if (!b.success) return { status: 400, body: { error: 'Invalid body' } };

        const updated = await budgetService.upsertBudget({
            teamId: b.data.teamId,
            amount: b.data.amount,
            month: b.data.month,
            categoryId: b.data.categoryId,
            rollover: b.data.rollover
        })

        if (!updated) return { status: 404, body: { error: 'Budget not found' } };

        return { status: 200, body: updated };
    }catch (e) {
        return toHttpResult(e);
    }
}

export async function deleteBudgetController(query: URLSearchParams): Promise<HttpResult> {
    try {
        const q = DeleteBudgetQuery.safeParse(Object.fromEntries(query.entries()));
        if (!q.success) return { status: 400, body: { error: 'Must provide a valid id and teamId' } };

        await budgetService.deleteBudgetById(q.data.id, q.data.teamId);

        return { status: 204, body: null };
    } catch (e) {
        return toHttpResult(e);
    }
}
