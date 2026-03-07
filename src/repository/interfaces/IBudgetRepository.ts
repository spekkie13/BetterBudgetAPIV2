import { BudgetInsert, BudgetPatch, BudgetRow } from '@/db/types/budgetTypes';

export interface IBudgetRepository {
    create(data: BudgetInsert): Promise<BudgetRow>;
    getById(teamId: number, id: number): Promise<BudgetRow>;
    listByTeam(teamId: number): Promise<BudgetRow[]>;
    updateById(teamId: number, id: number, data: BudgetPatch): Promise<BudgetRow>;
    deleteById(teamId: number, id: number): Promise<void>;
    exists(teamId: number, id: number): Promise<boolean>;
    selectByMonth(teamId: number, month: string): Promise<BudgetRow[]>;
    selectByCategory(teamId: number, categoryId: number): Promise<BudgetRow[]>;
    selectByMonthAndCategory(teamId: number, month: string, categoryId: number): Promise<BudgetRow>;
}
