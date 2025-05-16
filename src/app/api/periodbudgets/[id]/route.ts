// File: /app/api/periodbudgets/[id]/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {deleteManyBudgets, updateBudget} from "@/lib/services/periodbudgetService";

export async function PUT(req: NextRequest) {
    const body = await req.json();

    const updated = await updateBudget(body)
    return jsonWithCors(updated);
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (idParam) {
        const id = parseInt(idParam);
        await deleteManyBudgets(id)
        return jsonWithCors({ message: 'Period budget deleted' });
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
