import {ForbiddenError} from "@/models/errors/base";

export class TransactionAccessDeniedError extends ForbiddenError {
    constructor(transactionId: number) {
        super(`You don't have access to transaction ${transactionId}`);
    }
}
