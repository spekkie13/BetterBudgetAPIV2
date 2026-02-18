import {ValidationError} from "@/model/errors/base";

export class InvalidTransactionTypeError extends ValidationError {
    constructor(type: string) {
        super(`Invalid transaction type: ${type}. Must be 'income' or 'expense'.`, 'transactionType');
    }
}
