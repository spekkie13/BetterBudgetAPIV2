import {BudgetService} from "@/adapters/services/budgetService";
import {BudgetInsert, BudgetPatch} from "@/db/types/budgetTypes";
import {Response} from "@/core/http/Response";

export function makeBudgetController(svc: BudgetService) {
    return {
        async getBudgets(teamId: number, categoryId?: number, month?: string | null) {
            if (categoryId !== undefined && month) {
                const budget = await svc.selectByMonth(teamId, month, categoryId);
                return budget ?
                    new Response({ data: budget, status: 200, message: 'request successful'}) :
                    new Response({ data: null, status: 404, message: 'No budgets found'});                }

            if (categoryId !== 0) {
                let rows = await svc.selectAllByTeam(teamId);
                rows = rows.filter(r => r.categoryId === categoryId);
                return rows.length > 0 ?
                    new Response({ data: rows, status: 200, message: 'request successful'}) :
                    new Response({ data: null, status: 404, message: 'No budgets found'});                }

            if (month) {
                let rows = await svc.selectAllByTeam(teamId);
                rows = rows.filter(r => r.periodMonth === month);
                return rows.length > 0 ?
                    new Response({ data: rows, status: 200, message: 'request successful'}) :
                    new Response({ data: null, status: 404, message: 'No budgets found'});                }

            const rows = await svc.selectAllByTeam(teamId);
            return rows.length > 0 ?
                new Response({ data: rows, status: 200, message: 'request successful'}) :
                new Response({ data: null, status: 404, message: 'No budgets found'});
        },

        async createBudget(teamId: number, body: BudgetInsert) {
            const created = await svc.insert({ ...body, teamId });
            return created ?
                new Response({ data: created, status: 201, message: 'successfully created' }) :
                new Response({ data: null, status: 400, message: 'No budget created' });
        },

        async updateBudget(teamId: number, id: number, body: BudgetPatch) {
            const updated = await svc.updateByIdTeam(teamId, id, body);
            return updated ?
                new Response({ data: updated, status: 201, message: 'successfully updated' }) :
                new Response({ data: null, status: 400, message: 'No budget updated' });
            },

        async deleteBudget(teamId: number, id: number) {
            await svc.deleteByIdTeam(teamId, id);
            return new Response({ data: null, status: 204, message: 'successfully deleted' });
        },
    }
}
