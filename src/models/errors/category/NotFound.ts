import {NotFoundError} from "@/models/errors/base";

export class CategoryNotFoundError extends NotFoundError {
    constructor(id: number) {
        super('Category', id);
    }
}
