import { NextRequest, NextResponse } from "next/server";
import { Response } from '@/core/http/Response';
import { userService } from "@/service/userService";
import { Team, User, UserWithTeam } from "@/models";
import {AppError, InvalidTokenError, UserNotFoundError} from "@/models/errors";
import { UserWithTeamsRow } from "@/db/types/userTypes";

const ALLOWED_ORIGINS: string[] = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    'https://other-budget.vercel.app',
    'https://betterbudget.itsspekkie.com',
    process.env.APP_ORIGIN ?? '',        // e.g. https://app.example.com
].filter(Boolean)

const USE_CREDENTIALS: boolean = true

export function preflightResponse(req: Request): NextResponse {
    const origin : string = resolveOrigin(req)
    const reqMethod : string = req.headers.get('access-control-request-method') || 'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    const reqHeaders : string = req.headers.get('access-control-request-headers') || 'Content-Type, Authorization'

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

export function toApiResponse(request: NextRequest, error: AppError): NextResponse {
    const response = new Response({
        data: error,
        status: error.statusCode,
        error: error.message,
        success: false,
    });
    return jsonWithCors(request, response, error.statusCode)
}

export function ok<T>(req: Request, data: T, message = 'OK', status = 200): NextResponse {
    const body: Response<T> = { data, message, status, success: true };
    return jsonWithCors(req, body, status);
}

export async function getUserDataByToken(req: NextRequest) : Promise<UserWithTeam> {
    const token: string | undefined =
        req.headers.get('authorization')?.split('Bearer ')[1] ??
        new URL(req.url).searchParams.get('userId') ??
        undefined;

    if (!token)
        throw new InvalidTokenError();

    let userData : UserWithTeamsRow | null = await userService.getUserByToken(token);
    if (!userData)
        throw new UserNotFoundError();

    let user: User = User.create(userData);
    const teams: Team[] = userData.teams.map(t => Team.create(t));

    return new UserWithTeam(user, teams);
}

function resolveOrigin(req: Request): string {
    const origin : string = req.headers.get('origin') ?? ''
    return ALLOWED_ORIGINS.includes(origin) ? origin : ''
}

export function jsonWithCors(req: Request, data: Response<unknown>, status = 200): NextResponse {
    const origin : string = req ? resolveOrigin(req) : ''
    const res = NextResponse.json(data, { status })

    if (origin) {
        res.headers.set('Access-Control-Allow-Origin', origin)
        if (USE_CREDENTIALS) res.headers.set('Access-Control-Allow-Credentials', 'true')
    }

    res.headers.set('Vary', 'Origin')
    return res
}
