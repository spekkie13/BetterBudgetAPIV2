import { ApiDataResponse } from '@/models/ApiDataResponse';
import { jsonWithCors } from '@/lib/cors';

export function ok<T>(data: T, message = 'OK', status = 200) {
    const body: ApiDataResponse<T> = { data, message, status, success: true };
    return jsonWithCors(body, status);
}

export function fail(message: string, status = 400) {
    const body: ApiDataResponse<null> = { data: null, message, status, success: false };
    return jsonWithCors(body, status);
}
