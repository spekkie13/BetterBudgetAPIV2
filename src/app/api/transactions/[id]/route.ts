// app/api/transactions/mutation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { ok, fail } from '@/lib/utils/apiResponse';
import { updateTransaction, deleteTransactionById, getTransactionById } from '@/lib/services/transaction/transactionService';
import { z } from 'zod'

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

const QuerySingle = z.object({
    teamId: z.string().transform(Number),
});

export async function GET(req: NextRequest, ctx : any) {
    const { id } = (ctx as { params: { id: string } }).params;
    if (!Number.isInteger(id)) return fail(400, 'Invalid id');

    const parsed = QuerySingle.safeParse({
        teamId: new URL(req.url).searchParams.get('teamId'),
    });
    if (!parsed.success || !Number.isInteger(parsed.data.teamId)) {
        return NextResponse.json({ error: 'Invalid teamId' }, { status: 400, headers: corsHeaders });
    }

    const row = await getTransactionById(parsed.data.teamId, Number(id));
    return ok(row ?? {});
}

/**
 * PUT (or PATCH) – update a transaction (income/expense/transfer)
 * Body:
 *  {
 *    id: number,
 *    teamId: number,
 *    amount?: number,            // major units; service handles cents/sign
 *    date?: string | Date,
 *    accountId?: number,
 *    categoryId?: number | null, // null when using splits
 *    payee?: string | null,
 *    description?: string | null,
 *    splits?: null | { categoryId: number; amount: number }[]
 *  }
 */
// app/api/transactions/[id]/route.ts
export async function PUT(req: NextRequest, ctx : any) {
    const { idStr, teamIdStr } = (ctx as { params: { idStr: string; teamIdStr: string } }).params;
    const id = Number(idStr);
    const teamId = Number(teamIdStr);
    try {
        const body = await req.json();
        if (!Number.isInteger(id)) return fail(400,'Valid id is required');
        if (!Number.isInteger(teamId)) return fail(400,'Valid teamId is required');

        const updated = await updateTransaction({
            id,
            teamId,
            amountCents: body?.amount,
            postedAt: body?.date ? new Date(body.date) : undefined,
            accountId: body?.accountId,
            categoryId: body?.categoryId ?? undefined,
            payee: body?.payee,
            memo: body?.description,
            splits:
                body?.splits === null ? null :
                    Array.isArray(body?.splits) ? body.splits : undefined,
        });

        return ok(updated ?? {}, 'Transaction updated');
    } catch (err) {
        console.error('Error updating transaction:', err);
        return fail(500,'Failed to update transaction');
    }
}

/**
 * DELETE – soft delete a transaction
 * Body: { id: number, teamId: number }
 */
export async function DELETE(req: NextRequest, ctx : any) {
    const { idStr } = (ctx as { params: { idStr: string } }).params;

    try {
        const id = Number(idStr);
        let body: any = null;
        try {
            body = await req.json();
        } catch {
            // DELETE request without body — that's fine
        }
        const teamIdStr = body?.teamId ?? new URL(req.url).searchParams.get('teamId');
        const teamId = Number(teamIdStr);

        if (!Number.isInteger(id)) return fail(400,'Valid id is required');
        if (!Number.isInteger(teamId)) return fail(400,'Valid teamId is required');

        await deleteTransactionById(teamId, id);
        return ok({}, 'Transaction deleted');
    } catch (error) {
        console.error('DELETE /api/transactions/[id] error:', error);
        return fail(500, 'Failed to delete transaction');
    }
}
