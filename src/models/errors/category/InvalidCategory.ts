import {ValidationError} from "@/models/errors/base";

export class InvalidCategoryDataError extends ValidationError {
    constructor(field: string, issue: string) {
        super(`Invalid category ${field}: ${issue}`, field);
    }
}
