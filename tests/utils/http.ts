import {NextRequest} from "next/server";

export function buildUrl(base: string, params?: Record<string, string | number | undefined | null>) {
    const u = new URL(base, 'http://localhost');
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
        }
    }
    return u.toString();
}

export function jsonReq(method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE', url: string, body?: any, headers?: Record<string,string>) {
    return new NextRequest(url, {
        method,
        headers: {
            'content-type': 'application/json',
            ...(headers ?? {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}
