import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/cors'
import { ok, fail } from '@/lib/utils/apiResponse'
import { updateBudget, deleteBudgetById } from '@/lib/services/budgetService'

export async function PUT(req: NextRequest, { params } : { params: { id: string } }) {
    try {
        // ID comes only from the URL path
        const id = Number(params?.id);
        if (!Number.isInteger(id)) return fail('Valid id is required', 400);

        const body = await req.json();

        // Related context can come from body (teamId is not a resource ID, so it’s fine here)
        const teamId = Number(body?.teamId);
        if (!Number.isInteger(teamId)) return fail('Valid teamId is required', 400);

        const updated = await updateBudget({
            id,
            teamId,
            amount: body?.amount !== undefined ? Number(body.amount) : undefined,
            month: body?.month, // "YYYY-MM" or Date; service normalizes
            categoryId: body?.categoryId !== undefined ? Number(body.categoryId) : undefined,
            rollover: body?.rollover !== undefined ? Boolean(body.rollover) : undefined,
        });

        if (!updated) return fail('Budget not found', 404);
        return ok(updated);
    } catch (e) {
        console.error('PUT /api/budgets/[id] error:', e);
        return fail('Internal server error', 500);
    }
}

export async function DELETE(req: NextRequest, { params } : { params: { id: string } }) {
    try {
        // id must come from the route param
        const id = Number(params?.id);
        if (!Number.isInteger(id)) return fail('Valid id is required', 400);

        // optional body (but we expect teamId in it for auth/guarding)
        let teamId: number | null = null;
        if (req.headers.get('content-type')?.includes('application/json')) {
            const body = await req.json().catch(() => ({}));
            teamId = Number(body?.teamId);
        }

        if (!Number.isInteger(teamId)) return fail('Valid teamId is required', 400);

        await deleteBudgetById(teamId!, id);
        // Choose either 200 with a body...
        return ok({ id }, 'Budget deleted'); // 200
        // ...or 204 no-content (then return new NextResponse(null, { status: 204 }))
    } catch (e) {
        console.error('DELETE /api/budgets/[id] error:', e);
        return fail('Internal server error', 500);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
