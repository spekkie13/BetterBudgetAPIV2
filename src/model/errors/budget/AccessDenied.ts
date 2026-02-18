import {ForbiddenError} from "@/model/errors/base";

export class BudgetAccessDeniedError extends ForbiddenError {
    constructor(budgetId: number) {
        super(`You don't have access to budget ${budgetId}`);
    }
}
