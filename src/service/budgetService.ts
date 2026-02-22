import { BudgetInsert, BudgetPatch, BudgetRow } from "@/db/types/budgetTypes";
import { budgetRepository } from "@/repository/budgetRepo";
import {monthToDate} from "@/core/date";

export class BudgetService {
    async createBudget(data: BudgetInsert) : Promise<BudgetRow> {
        return await budgetRepository.create(data);
    }

    async updateBudget(teamId: number, id: number, data: BudgetPatch) {
       return await budgetRepository.updateById(teamId, id, data);
    }

    async deleteBudget(teamId: number, id: number) : Promise<void> {
        return await budgetRepository.deleteById(teamId, id);
    }

    async budgetExists(teamId: number, id: number) : Promise<boolean> {
        return await budgetRepository.exists(teamId, id);
    }

    async getBudgetById(teamId: number, id: number) : Promise<BudgetRow> {
        return await budgetRepository.getById(teamId, id);
    }

    async getBudgets(teamId: number, month?: string|null, categoryId?: number): Promise<BudgetRow|BudgetRow[]> {
        if (categoryId && month) {
            return await budgetRepository.selectByMonthAndCategory(teamId, monthToDate(month), categoryId);
        }

        if (categoryId) {
            return await budgetRepository.selectByCategory(teamId, categoryId);
        }

        if (month) {
            return await budgetRepository.selectByMonth(teamId, month);
        }

        return await budgetRepository.listByTeam(teamId);
    }

    async selectAllByTeam(teamId: number): Promise<BudgetRow[]> {
        return await budgetRepository.listByTeam(teamId);
    }
}

export const budgetService = new BudgetService();
