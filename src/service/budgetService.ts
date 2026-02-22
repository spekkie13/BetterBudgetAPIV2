import { BudgetInsert, BudgetPatch, BudgetRow } from "@/db/types/budgetTypes";
import { budgetRepository } from "@/repository/budgetRepo";
import { categoryRepository } from "@/repository/categoryRepo";

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

    async getBudgets(teamId: number, month?: string|null, categoryId?: number): Promise<BudgetRow[]> {
        if (categoryId && month) {
            return await budgetRepository.selectByMonthAndCategory(teamId, month, categoryId);
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

    async ensureBudgetsForAllCategories(teamId: number, fromMonth: string, monthsAhead: number = 12): Promise<void> {
        const categories = await categoryRepository.listByTeam(teamId);

        for (const category of categories) {
            await this.ensureBudgetsForCategory(teamId, category.id, fromMonth, monthsAhead);
        }
    }

    async ensureBudgetsForCategory(teamId: number, categoryId: number, fromMonth: string, monthsAhead: number): Promise<void> {
        const months = this.generateNextMonths(fromMonth, monthsAhead);

        for (const month of months) {
            const existing = await budgetRepository.selectByMonthAndCategory(teamId, month, categoryId);

            if (existing.length === 0) {
                // Get last budget amount or use default
                const lastBudget = await budgetRepository.findLatestForCategory(teamId, categoryId, month);
                const amount = lastBudget?.amountCents ?? 0;

                // Create budget
                await budgetRepository.create({
                    teamId,
                    categoryId,
                    periodMonth: month,
                    amountCents: amount,
                    rollover: lastBudget?.rollover ?? false,
                });
            }
        }
    }

    private generateNextMonths(fromMonth: string, count: number): string[] {
        const months: string[] = [];
        const [year, month] = fromMonth.split('-').map(Number);

        let currentYear = year;
        let currentMonth = month;

        for (let i = 0; i < count; i++) {
            const monthStr = String(currentMonth).padStart(2, '0');
            months.push(`${currentYear}-${monthStr}-01`);

            currentMonth++;
            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }
        }

        return months;
    }
}

export const budgetService = new BudgetService();
