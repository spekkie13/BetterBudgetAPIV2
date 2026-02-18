import { NotFoundError } from '@/models/errors/base';

export class TransactionNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Transaction', id);
    }
}
