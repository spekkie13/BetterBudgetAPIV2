import { toHttpResult } from '@/lib/http/shared/errors';
import {BudgetService} from "@/lib/services/budget/budgetService";
import {fail, ok} from "@/lib/utils/apiResponse";
import {CreateBudgetInput} from "@/db/types/accountTypes";
import {BudgetInsert} from "@/app/meta/insertModel";

export function makeBudgetController(svc: BudgetService) {
    return {
        async getBudgets(teamId: number, budgetId: number, categoryId: number, month: string) {
            try {
                // 1) /api/budgets?teamId=1&budgetId=123
                if (budgetId !== undefined) {
                    const budget = await svc.selectByIdTeam(teamId, budgetId);
                    return { status: 200, body: budget ?? {} };
                }

                // 2) /api/budgets?teamId=1&categoryId=2&month=YYYY-MM
                if (categoryId !== undefined && month) {
                    const budget = await svc.selectByMonth(teamId, month, categoryId);
                    return { status: 200, body: budget ?? {} };
                }

                // 3) /api/budgets?teamId=1&categoryId=2
                if (categoryId !== undefined) {
                    let rows = await svc.selectAllByTeam(teamId);
                    rows = rows.filter(r => r.id === categoryId);
                    return { status: 200, body: rows };
                }

                // 4) /api/budgets?teamId=1&month=YYYY-MM
                if (month) {
                    let rows = await svc.selectAllByTeam(teamId);
                    rows = rows.filter(r => r.periodMonth === month);
                    return { status: 200, body: rows };
                }

                // 5) /api/budgets?teamId=1
                const rows = await svc.selectAllByTeam(teamId);
                return { status: 200, body: rows };
            } catch (e) {
                return toHttpResult(e);
            }
        },

        async createBudget(teamId: number, body: CreateBudgetInput) {
            const created = await svc.insert({ ...body, teamId });        // ✅ add teamId, and await
            return ok(created, 'budget created successfully',201);
        },

        async updateBudget(teamId: number, id: number, body: BudgetInsert) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ? ok(updated) : fail(404, "budget not found");
        },

        async deleteBudget(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return ok(null, 'budget deleted succssfully',204);
        },
    }
}
