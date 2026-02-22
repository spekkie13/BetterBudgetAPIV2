import { NotFoundError } from '@/models/errors/base';

export class TeamNotFoundError extends NotFoundError {
    constructor(id?: number) {
        super('Team', id);
    }
}
