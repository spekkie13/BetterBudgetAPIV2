import { NextResponse } from 'next/server'

// Put your dev + prod origins here (or from env)
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'other-budget.vercel.app/',
    process.env.APP_ORIGIN ?? '',        // e.g. https://app.example.com
].filter(Boolean)

const USE_CREDENTIALS = true // flip to false if you never send cookies

function resolveOrigin(req: Request) {
    const origin = req.headers.get('origin') ?? ''
    // If you truly never use credentials you could return '*' here,
    // but since you plan to add auth later, keep an allow-list:
    return ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

/** For normal responses (GET/POST/etc) */
export function jsonWithCors(req: Request, data: any, status = 200) {
    const origin = req ? resolveOrigin(req) : ''
    const res = NextResponse.json(data, { status })

    if (origin) {
        res.headers.set('Access-Control-Allow-Origin', origin)
        if (USE_CREDENTIALS) res.headers.set('Access-Control-Allow-Credentials', 'true')
    }
    // Safe to include on non-preflight responses
    res.headers.set('Vary', 'Origin')
    return res
}

/** For preflight (OPTIONS) */
export function preflightResponse(req: Request) {
    const origin = resolveOrigin(req)
    const reqMethod = req.headers.get('access-control-request-method') || 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    const reqHeaders = req.headers.get('access-control-request-headers') || 'Content-Type, Authorization'

    const headers: Record<string, string> = {
        'Access-Control-Allow-Origin': origin || 'null',
        'Access-Control-Allow-Methods': reqMethod,
        'Access-Control-Allow-Headers': reqHeaders,
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
    }
    if (origin && USE_CREDENTIALS) headers['Access-Control-Allow-Credentials'] = 'true'

    return new NextResponse(null, { status: 204, headers })
}
