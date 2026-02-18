import {ValidationError} from "@/models/errors/base";

export class FutureDateNotAllowedError extends ValidationError {
    constructor(date: string) {
        super(`Transaction date cannot be in the future: ${date}`, 'postedAt');
    }
}
