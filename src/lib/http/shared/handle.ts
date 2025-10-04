import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { z } from 'zod';
import { HttpResult, toHttpResult } from './errors';

export function json(res: HttpResult) {
    return NextResponse.json(res.body, { status: res.status, headers: corsHeaders });
}

// Standardized GET handler wrapper: parses query via schema and returns JSON with CORS.
export async function handleGet<S extends z.ZodTypeAny>(
    req: NextRequest,
    schema: S,
    fn: (input: z.infer<S>) => Promise<HttpResult>
) {
    try {
        const { searchParams } = new URL(req.url);
        const shaped: Record<string, unknown> = {};
        for (const [k, v] of searchParams.entries()) shaped[k] = v;

        const parsed = schema.safeParse(shaped);
        if (!parsed.success) return json({ status: 400, body: { error: 'Invalid query' } });

        const result = await fn(parsed.data);
        return json(result);
    } catch (e) {
        return json(toHttpResult(e));
    }
}
