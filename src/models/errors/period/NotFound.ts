import { NotFoundError } from "@/models/errors/base";

export class PeriodNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Period', id);
    }
}