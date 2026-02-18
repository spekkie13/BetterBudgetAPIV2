import {ConflictError} from "@/models/errors/base";

export class CategoryAlreadyExistsError extends ConflictError {
    constructor(name: string) {
        super(`Category '${name}' already exists in this team`);
    }
}
