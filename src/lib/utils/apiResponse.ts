import { ApiDataResponse } from '@/models/http/ApiDataResponse';
import { jsonWithCors } from '@/lib/utils/cors';

export function ok<T>(data: T, message = 'OK', status = 200) {
    const body: ApiDataResponse<T> = { data, message, status, success: true };
    return jsonWithCors(body, status);
}

export function fail(status = 400, message: string) {
    const body: ApiDataResponse<null> = { data: null, message, status, success: false };
    return jsonWithCors(body, status);
}
