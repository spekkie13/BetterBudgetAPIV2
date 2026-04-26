import { NotFoundError } from "@/models/errors/base";

export class ResultNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Result', id);
    }
}