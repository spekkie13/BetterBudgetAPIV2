import {ValidationError} from "jest-validate";

export class InvalidCategoryDataError extends ValidationError {
    constructor(field: string, issue: string) {
        super(`Invalid category ${field}: ${issue}`, field);
    }
}
