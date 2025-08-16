import {
    getBudgetById,
    getBudgetByMonthAndCategory,
    getBudgetsByCategory,
    getBudgetsByMonth,
    getAllBudgets,
    createBudget, updateBudget, deleteBudgetById,
} from '@/lib/services/budget/budgetService';
import { BudgetQueryInput, CreateBudgetInput } from './budgetSchemas';
import {AppError, HttpResult, toHttpResult} from '@/lib/http/shared/errors';
import {DeleteBudgetInput, UpdateBudgetBody} from "@/lib/http/budgets/budgetIdSchema";

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

export async function createBudgetController(input: CreateBudgetInput): Promise<HttpResult> {
    try {
        const created = await createBudget({
            teamId: input.teamId,
            categoryId: input.categoryId,
            month: input.month,
            amount: input.amount,
            rollover: input.rollover ?? false,
        });
        return { status: 201, body: created };
    } catch (e) {
        return toHttpResult(e);
    }
}

function parseId(raw?: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id)) throw new AppError('BAD_REQUEST', 'Valid id is required', 400);
    return id;
}

export async function updateBudgetController(ctxId: string, body: unknown): Promise<HttpResult> {
    try {
        const id = parseId(ctxId);

        const parsed = UpdateBudgetBody.safeParse(body);
        if (!parsed.success) {
            return { status: 400, body: { error: 'Invalid body' } };
        }

        const { teamId, amount, month, categoryId, rollover } = parsed.data;

        const updated = await updateBudget({
            id,
            teamId,
            amount: Number(amount),
            month,
            categoryId,
            rollover: Boolean(rollover),
        });

        if (!updated) {
            return { status: 404, body: { error: 'Budget not found' } };
        }

        return { status: 200, body: updated };
    } catch (e) {
        return toHttpResult(e);
    }
}

export async function deleteBudgetController(ctxId: string, input: unknown): Promise<HttpResult> {
    try {
        const id = parseId(ctxId);

        // Support teamId via JSON body or query; validation happens here
        const parsed = DeleteBudgetInput.safeParse(input);
        if (!parsed.success) {
            return { status: 400, body: { error: 'Valid teamId is required' } };
        }

        const { teamId } = parsed.data;

        await deleteBudgetById(teamId, id);
        // If your service returns false on not-found, map to 404 instead.
        return { status: 204, body: null };
    } catch (e) {
        return toHttpResult(e);
    }
}
