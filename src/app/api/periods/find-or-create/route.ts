// File: /app/api/periods/find-or-create/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from '@/lib/cors';
import {createPeriod, getPeriodByStartDate} from "@/lib/services/periodService";

export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate, startingAmount } = await req.json();
        const existing = await getPeriodByStartDate(startDate);
        if (existing) {
            return jsonWithCors(existing);
        }

        const created = await createPeriod({startDate, endDate, startingAmount});
        return jsonWithCors(created, 201);
    } catch (error) {
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
