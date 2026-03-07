import { db } from '@/db/client';
import {and, eq} from "drizzle-orm";
import {budgets} from "@/db/schema/budgets"
import {BudgetInsert, BudgetPatch, BudgetRow} from "@/db/types/budgetTypes";
import {BudgetNotFoundError} from "@/models/errors/budget/NotFound";
import {BudgetNotFoundForTeamError} from "@/models/errors";

export class BudgetRepository {
    async create(data: BudgetInsert) : Promise<BudgetRow> {
        const [row] = await db
            .insert(budgets)
            .values(data)
            .returning();

        return row;
    }

    async getById(teamId: number, id: number): Promise<BudgetRow> {
        const [row] = await db
            .select()
            .from(budgets)
            .where(
                and(
                    eq(budgets.teamId, teamId),
                    eq(budgets.id, id)
                )
            )
            .limit(1);

        return row;
    }

    async listByTeam(teamId: number): Promise<BudgetRow[]> {
        return await db
            .select()
            .from(budgets)
            .where(eq(budgets.teamId, teamId));
    }

    async updateById(teamId: number, id: number, data: BudgetPatch): Promise<BudgetRow> {
        const [row] = await db
            .update(budgets)
            .set(data)
            .where(
                and(
                    eq(budgets.teamId, teamId),
                    eq(budgets.id, id)
                )
            )
            .returning();

        if (!row)
            throw new BudgetNotFoundError(id);

        return row;
    }

    async deleteById(teamId: number, id: number): Promise<void> {
        await db
            .delete(budgets)
            .where(
                and(
                    eq(budgets.teamId, teamId),
                    eq(budgets.id, id)
                )
            );
    }

    async exists(teamId: number, id: number): Promise<boolean> {
        const [row] = await db
            .select()
            .from(budgets)
            .where(
                and(
                    eq(budgets.teamId, teamId),
                    eq(budgets.id, id)
                )
            )
            .limit(1);

        if (!row)
            return false;

        return true;
    }

    async selectByMonth(teamId: number, month: string): Promise<BudgetRow[]> {
        return await db
            .select()
            .from(budgets)
            .where(and(
                eq(budgets.teamId, teamId),
                eq(budgets.periodMonth, month),
            ));
    }

    async selectByCategory(teamId: number, categoryId: number): Promise<BudgetRow[]> {
        return await db
            .select()
            .from(budgets)
            .where(and(
                eq(budgets.teamId, teamId),
                eq(budgets.categoryId, categoryId),
            ));
    }

    async selectByMonthAndCategory(teamId: number, month: string, categoryId: number): Promise<BudgetRow> {
        const [row] = await db
            .select()
            .from(budgets)
            .where(and(
                eq(budgets.teamId, teamId),
                eq(budgets.categoryId, categoryId),
                eq(budgets.periodMonth, month),
            ))
            .limit(1);

        if (!row) {
            throw new BudgetNotFoundForTeamError(teamId);
        }

        return row;
    }
}

export const budgetRepository = new BudgetRepository();
