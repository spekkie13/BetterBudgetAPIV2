import {NotFoundError} from "@/model/errors/base";

export class CategoryNotFoundForBudgetError extends NotFoundError {
    constructor(categoryId: number) {
        super('Category', categoryId);
    }
}
