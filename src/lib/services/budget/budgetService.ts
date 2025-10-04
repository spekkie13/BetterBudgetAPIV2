import {makeBudgetRepo} from "@/adapters/repo/budgetRepo";
import {TeamScopedServiceBase} from "@/lib/services/teamScopedServiceBase";
import {BudgetRow} from "@/app/meta/rowModel";
import {BudgetInsert} from "@/app/meta/insertModel";
import {BudgetPatch} from "@/app/meta/patchModel";
import {makeBudgetKey} from "@/app/meta/keys";
import {db} from "@/db/client";
import {budgets} from "@/db/schema";
import {and, eq} from "drizzle-orm";

export class BudgetService extends TeamScopedServiceBase<
BudgetRow,
number,
number,
BudgetInsert,
BudgetPatch
> {
    constructor(){
        super(makeBudgetRepo())
    }

    async selectByMonth(teamId: number, month: string, categoryId: number): Promise<BudgetRow | null> {
        const key = makeBudgetKey(teamId, categoryId, month);

        const rows = await db
            .select()
            .from(budgets)
            .where(and(
                eq(budgets.teamId, key.teamId),
                eq(budgets.categoryId, key.categoryId),
                eq(budgets.periodMonth, key.periodMonth),
            ))
            .limit(1);
        return rows[0] ?? null;
    }
}
