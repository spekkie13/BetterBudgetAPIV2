import {BadRequestError} from "@/model/errors/base";

export class CategoryInUseError extends BadRequestError {
    constructor(categoryId: number, reason: 'budgets' | 'transactions' | 'both') {
        const msg = reason === 'both'
            ? `Cannot delete category ${categoryId}: it has budgets and transactions`
            : `Cannot delete category ${categoryId}: it has ${reason}`;
        super(msg);
    }
}
