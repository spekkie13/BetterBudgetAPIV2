import { UserService } from '@/adapters/services/userService';
import {UserBodyInput} from "@/db/types/userTypes";
import { ApiDataResponse } from "@/core/http/ApiDataResponse";
import { BudgetService } from "@/adapters/services/budgetService";
import {addMonthsStr, currentMonthStr, toMonthStartString} from "@/core/date";
import {applyRolloverForMonth} from "@/core/budgetCalculator";
import {CategoryService} from "@/adapters/services/categoryService";

export function makeUserController(svc: UserService) {
    return {
        async listUsers() {
            const items = await svc.listAll();
            return items ?
                new ApiDataResponse({data: items, status: 200, message: 'successfully listed users'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No users found'});
        },

        async getUser(id: number) {
            const user = await svc.selectById(id);
            return user ?
                new ApiDataResponse({data: user, status: 200, message: 'successfully fetched user'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No user found'});
        },

        async createUser(body: UserBodyInput) {
            const created = await svc.createUser({ ...body });
            return created ?
                new ApiDataResponse({data: created, status: 201, message: 'successfully created user'}) :
                new ApiDataResponse({data: null, status: 400, message: 'No user created'});
        },

        async updateUser(id: number, body: UserBodyInput) {
            const updated = await svc.updateById(id, body);
            return updated ?
                new ApiDataResponse({data: updated, status: 201, message: 'successfully updated user'}) :
                new ApiDataResponse({data: null, status: 400, message: 'No user updated'});
        },

        async deleteUser(id: number) {
            await svc.deleteById(id);
            return new ApiDataResponse({
                data: null,
                status: 204,
                message: 'successfully deleted user'
            })
        },

        async getUserByEmail(email: string) {
            const user = await svc.selectByEmail(email);

            if (user) {
                const updateBudgets = await this.ensureUserBudgets(user.teams[0].id);
                if (updateBudgets) {
                    console.log('updating budgets');
                    const budgetService = new BudgetService();
                    const fromDate = toMonthStartString(new Date());
                    await budgetService.ensureBudgetsForAllCategories(user.teams[0].id, fromDate);

                    const startMonth = currentMonthStr();
                    const prevMonth = addMonthsStr(startMonth, -1);

                    await applyRolloverForMonth(user.teams[0].id, prevMonth);
                }
            }

            return user ?
                new ApiDataResponse({data: user, status: 200, message: 'successfully fetched user'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No user found'});
        },

        async getUserByTeamId(teamId: number) {
            const users = await svc.selectByTeamId(teamId);
            return users ?
                new ApiDataResponse({data: users, status: 200, message: 'successfully fetched users'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No users found'});
        },

        async getUserByToken(token: string) {
            const users = await svc.selectByToken(token);
            return users ?
                new ApiDataResponse({data: users, status: 200, message: 'successfully fetched users'}) :
                new ApiDataResponse({data: null, status: 404, message: 'No users found'});
        },

        async ensureUserBudgets(teamId: number) {
            const budgetService = new BudgetService();
            const categoryService = new CategoryService();

            let budgets = await budgetService.selectAllByTeam(teamId);
            budgets = budgets.filter(budget => budget.periodMonth > toMonthStartString(new Date()));
            let categories = await categoryService.selectAllByTeam(teamId);

            return categories.length * 11 !== budgets.length;
        }
    }
}
