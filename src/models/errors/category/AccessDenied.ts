import {ForbiddenError} from "@/models/errors/base";

export class CategoryAccessDeniedError extends ForbiddenError {
    constructor(categoryId: number) {
        super(`Category ${categoryId} does not belong to your team.`);
    }
}
