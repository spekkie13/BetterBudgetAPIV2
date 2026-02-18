import {ValidationError} from "jest-validate";

export class InvalidBudgetAmountError extends ValidationError {
    constructor(amount: number) {
        super(`Budget amount must be positive, got ${amount}`, 'amountCents');
    }
}
