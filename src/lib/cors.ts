/**
 * Wrap your route handler with this function to automatically
 * inject CORS headers and handle preflight (OPTIONS) requests.
 */
import { NextResponse } from 'next/server';

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
}

export function jsonWithCors(data: any, status: number = 200) {
    const response = NextResponse.json(data, { status })
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
    })
    return response
}

