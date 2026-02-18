import {NotFoundError} from "@/model/errors/base";

export class AccountNotFoundForTransactionError extends NotFoundError {
    constructor(accountId: number) {
        super('Account', accountId);
    }
}
