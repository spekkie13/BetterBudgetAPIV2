import {ForbiddenError} from "@/model/errors/base";

export class CategoryAccessDeniedError extends ForbiddenError {
    constructor(categoryId: number) {
        super(`Category ${categoryId} does not belong to your team.`);
    }
}
