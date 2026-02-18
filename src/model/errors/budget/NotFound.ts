import {NotFoundError} from "@/model/errors/base";

export class BudgetNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Budget', id);
    }
}
