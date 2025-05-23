import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from '@/lib/cors';
import { getCategoryByName } from '@/lib/services/categoryService';

export async function POST(req: NextRequest) {
    try {
        const { name, userId } = await req.json();

        if (!name || typeof name !== 'string' || !userId || isNaN(userId)) {
            return jsonWithCors({ error: 'Invalid input' }, 400);
        }

        const category = await getCategoryByName(name, userId);
        return jsonWithCors({ exists: !!category });
    } catch (error) {
        console.error('Error checking category existence:', error);
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
