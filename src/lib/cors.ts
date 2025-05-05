import { NextRequest, NextResponse } from 'next/server'

/**
 * Wrap your route handler with this function to automatically
 * inject CORS headers and handle preflight (OPTIONS) requests.
 */
export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function corsHandler(req: NextRequest) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }

        // Preflight request (automatic browser call before e.g. POST)
        if (req.method === 'OPTIONS') {
            return new NextResponse(null, {
                status: 204,
                headers: corsHeaders,
            })
        }

        const response = await handler(req)

        // Inject CORS headers in actual response
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value)
        })

        return response
    }
}
