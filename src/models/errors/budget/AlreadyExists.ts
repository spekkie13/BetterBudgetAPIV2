import {ConflictError} from "@/models/errors/base";

export class BudgetAlreadyExistsError extends ConflictError {
    constructor(categoryId: number, period: string) {
        super(`Budget for category ${categoryId} in period ${period} already exists`);
    }
}
