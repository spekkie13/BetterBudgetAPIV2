import { NotFoundError } from '@/model/errors/base';

export class TransactionNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Transaction', id);
    }
}
