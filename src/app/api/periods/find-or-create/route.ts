// File: /app/api/periods/find-or-create/route.ts
import { NextRequest } from 'next/server';
import { jsonWithCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { startDate, endDate } = await req.json();

        const existing = await prisma.period.findFirst({
            where: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        if (existing) {
            return jsonWithCors(existing);
        }

        const created = await prisma.period.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        return jsonWithCors(created, 201);
    } catch (error) {
        console.error('Error in find-or-create period:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}
