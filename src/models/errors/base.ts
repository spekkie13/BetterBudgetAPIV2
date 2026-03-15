export class AppError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number = 500,
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ValidationError extends AppError {
    constructor(message: string, public readonly field?: string) {
        super(message, 400);
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: number | string) {
        super(
            id ? `${resource} with id ${id} not found` : `${resource} not found`,
            404
        );
    }
}

export class NotFoundForTeamError extends AppError {
    constructor(resource: string, teamId?: number | string) {
        super(
            teamId ? `${resource} not found for team with id ${teamId}` : `${resource} not found`,
            404
        )
    }
}

export class UnauthorizedError extends AppError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

export class ForbiddenError extends AppError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409);
    }
}

export class BadRequestError extends AppError {
    constructor (message: string) {
        super(message, 400);
    }
}

export class ZodValidationError extends ValidationError {
    constructor(
        public readonly errors: Array<{
            field: string;
            message: string;
        }>
    ) {
        const firstError = errors[0];
        super(
            errors.length === 1
                ? `${firstError.field}: ${firstError.message}`
                : `Multiple validation errors: ${errors.map(e => e.field).join(', ')}`,
            errors[0].field,
        );
    }
}
