import {ValidationError} from "@/model/errors/base";

export class InvalidTransactionAmountError extends ValidationError {
    constructor(amount: number, type: 'income' | 'expense') {
        super(`Invalid ${type} amount: ${amount}. Must be positive.`, 'amountCents');
    }
}
