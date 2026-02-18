import {NotFoundError} from "@/models/errors/base";

export class CategoryNotFoundForBudgetError extends NotFoundError {
    constructor(categoryId: number) {
        super('Category', categoryId);
    }
}
