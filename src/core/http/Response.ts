import { ApiDataResponse } from '@/core/http/ApiDataResponse';
import { jsonWithCors } from '@/core/http/cors';

export function ok<T>(req: Request, data: T, message = 'OK', status = 200) {
    const body: ApiDataResponse<T> = { data, message, status, success: true };
    return jsonWithCors(req, body, status);
}

export function fail(req: Request, status = 400, message: string) {
    const body: ApiDataResponse<null> = { data: null, message, status, success: false };
    return jsonWithCors(req, body, status);
}

export function isRequestSuccessful(status: number | undefined): boolean {
    if (status === undefined)
        return false;
    return status >= 200 && status < 300;
}
