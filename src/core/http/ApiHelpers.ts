import { NextRequest, NextResponse } from "next/server";
import { Response } from '@/core/http/Response';
import { UserService } from "@/adapters/services/userService";
import { makeUserController } from "@/adapters/controllers/userController";
import { Team, User, UserWithTeam } from "@/models";

const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'https://other-budget.vercel.app',
    process.env.APP_ORIGIN ?? '',        // e.g. https://app.example.com
].filter(Boolean)

const USE_CREDENTIALS = true

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

export function ok<T>(req: Request, data: T, message = 'OK', status = 200) {
    const body: Response<T> = { data, message, status, success: true };
    return jsonWithCors(req, body, status);
}

export function fail(req: Request, status = 400, message: string | undefined) {
    const body: Response<null> = { data: null, message, status, success: false };
    return jsonWithCors(req, body, status);
}

export function isRequestSuccessful(status: number | undefined): boolean {
    if (status === undefined)
        return false;
    return status >= 200 && status < 300;
}

export async function getUserDataByToken(req: NextRequest) : Promise<UserWithTeam | null> {
    const svc = new UserService();
    const controller = makeUserController(svc);

    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return null;

    let userData = await controller.getUserByToken(token);
    let user: User = User.create(userData.data);
    let team: Team = Team.create(userData.data?.teams[0])

    return new UserWithTeam(user, team);
}

function resolveOrigin(req: Request) {
    const origin = req.headers.get('origin') ?? ''
    // If you truly never use credentials you could return '*' here,
    // but since you plan to add auth later, keep an allow-list:
    return ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

function jsonWithCors(req: Request, data: any, status = 200) {
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
