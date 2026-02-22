import {UnauthorizedError} from "@/models/errors/base";

export class InvalidCredentialsError extends UnauthorizedError {
    constructor() {
        super('Invalid email or password');
    }
}
