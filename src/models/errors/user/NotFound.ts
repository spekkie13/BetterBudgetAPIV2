import { NotFoundError } from '@/models/errors/base';

export class UserNotFoundError extends NotFoundError {
    constructor(id?: number) {
        super('User', id);
    }
}
