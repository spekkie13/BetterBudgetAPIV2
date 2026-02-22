import {ConflictError} from "@/models/errors/base";

export class UserAlreadyExistsError extends ConflictError {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
    }
}
