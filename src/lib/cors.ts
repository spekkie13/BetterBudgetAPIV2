/**
 * Wrap your route handler with this function to automatically
 * inject CORS headers and handle preflight (OPTIONS) requests.
 */
import { NextRequest, NextResponse } from 'next/server';

export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function corsHandler(req: NextRequest) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (req.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: corsHeaders,
            });
        }

        const response = await handler(req);

        // Clone the response to avoid mutation errors
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            newHeaders.set(key, value);
        });

        return new NextResponse(await response.text(), {
            status: response.status,
            headers: newHeaders,
        });
    };
}
