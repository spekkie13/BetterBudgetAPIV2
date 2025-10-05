export class AppError extends Error {
    constructor(public code: string, message: string, public status = 400) {
        super(message);
    }
}
export const BadRequest = (msg='Bad request') => new AppError('BAD_REQUEST', msg, 400);
export const NotFound = (msg='Not found') => new AppError('NOT_FOUND', msg, 404);
export const Forbidden = (msg='Forbidden') => new AppError('FORBIDDEN', msg, 403);

export type HttpResult = { status: number; body: unknown };

export function toHttpResult(e: unknown): HttpResult {
    if (e instanceof AppError) return { status: e.status, body: { error: e.message, code: e.code } };
    console.error(e);
    return { status: 500, body: { error: 'Internal server error' } };
}


export const ACCOUNT_NOT_FOUND_ERROR = (accountNumber: number) => {
    return `Account: ${accountNumber} could not be found.`
}
