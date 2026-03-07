import { BudgetInsert, BudgetPatch, BudgetRow } from "@/db/types/budgetTypes";
import { budgetRepository } from "@/repository/budgetRepo";
import { monthToDate } from "@/core/date";
import { IBudgetRepository } from "@/repository/interfaces/IBudgetRepository";

export class BudgetService {
    constructor(private readonly repo: IBudgetRepository) {}

    async createBudget(data: BudgetInsert) : Promise<BudgetRow> {
        return await this.repo.create(data);
    }

    async updateBudget(teamId: number, id: number, data: BudgetPatch): Promise<BudgetRow> {
        return await this.repo.updateById(teamId, id, data);
    }

    async deleteBudget(teamId: number, id: number) : Promise<void> {
        return await this.repo.deleteById(teamId, id);
    }

    async budgetExists(teamId: number, id: number) : Promise<boolean> {
        return await this.repo.exists(teamId, id);
    }

    async getBudgetById(teamId: number, id: number) : Promise<BudgetRow> {
        return await this.repo.getById(teamId, id);
    }

    async getBudgets(teamId: number, month?: string|null, categoryId?: number): Promise<BudgetRow|BudgetRow[]> {
        if (categoryId && month) {
            return await this.repo.selectByMonthAndCategory(teamId, monthToDate(month), categoryId);
        }

        if (categoryId) {
            return await this.repo.selectByCategory(teamId, categoryId);
        }

        if (month) {
            return await this.repo.selectByMonth(teamId, monthToDate(month));
        }

        return await this.repo.listByTeam(teamId);
    }

    async selectAllByTeam(teamId: number): Promise<BudgetRow[]> {
        return await this.repo.listByTeam(teamId);
    }
}

export const budgetService = new BudgetService(budgetRepository);
