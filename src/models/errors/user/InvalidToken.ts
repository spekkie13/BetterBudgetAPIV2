import {UnauthorizedError} from "@/models/errors/base";

export class InvalidTokenError extends UnauthorizedError {
    constructor() {
        super('Invalid or expired token');
    }
}
