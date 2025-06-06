// File: /app/api/periods/find-or-create/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from '@/lib/cors';
import {createPeriod, getPeriodByStartDate} from "@/lib/services/periodService";

export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate } = await req.json();
        console.log(new Date(startDate))
        console.log(new Date(endDate))
        const existing = await getPeriodByStartDate(startDate);
        if (existing) {
            console.log(existing);
            return jsonWithCors(existing);
        }
        console.log("no existing period found, creating one...")
        const created = await createPeriod({startDate, endDate});
        return jsonWithCors(created, 201);
    } catch (error) {
        console.error('Error in find-or-create period:', error);
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
