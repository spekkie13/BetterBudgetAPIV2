import { NextRequest } from 'next/server';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionBody, TransactionInsert, TransactionParams } from "@/db/types/transactionTypes";
import { makeTransactionController } from "@/adapters/controllers/transactionController";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS() {
    return ok(null, '', 204);
}

export async function GET(req: NextRequest, ctx : any) {
    const { id } = (ctx as { params: { id: string } }).params;
    if (!Number.isInteger(id)) return fail(400, 'Invalid id');

    const parsed = TransactionParams.safeParse({
        teamId: new URL(req.url).searchParams.get('teamId'),
    });
    if (!parsed.success || !Number.isInteger(parsed.data.teamId))
        return fail(400, 'Invalid teamId');

    const result = await controller.getTransaction(parsed.data.teamId, Number(id));
    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx : any) {
    const { idStr, teamIdStr } = (ctx as { params: { idStr: string; teamIdStr: string } }).params;
    const id = Number(idStr);
    const teamId = Number(teamIdStr);

    const params = TransactionParams.safeParse({ id: id, teamId: teamId });
    if (!params.success)
        return fail(400, 'Invalid params');

    const body = await req.json();
    if (!Number.isInteger(id))
        return fail(400,'Valid id is required');

    if (!Number.isInteger(teamId))
        return fail(400,'Valid teamId is required');

    const parsedBody = TransactionBody.safeParse(body);
    if (!parsedBody.success)
        return fail(400, 'Invalid body');

    const transactionBody: TransactionInsert = {
        id: params.data.id ?? 0,
        teamId: params.data.teamId,
        accountId: parsedBody.data.accountId,
        amountCents: parsedBody.data.amountCents ?? 0,
        currency: parsedBody.data.currency,
        postedAt: new Date(parsedBody.data.postedAt ?? ""),
        payee: parsedBody.data.payee ?? "N/A",
        memo: parsedBody.data.memo ?? "N/A",
        categoryId: parsedBody.data.categoryId,
        isTransfer: parsedBody.data.isTransfer ?? false,
        transferGroupId: parsedBody.data.transferGroupId,
        createdBy: parsedBody.data.createdBy,
        createdAt: new Date(parsedBody.data.createdAt ?? ""),
        updatedAt: new Date(parsedBody.data.updatedAt ?? ""),
        deletedAt: new Date(parsedBody.data.deletedAt ?? ""),
    }

    const result = await controller.updateTransaction(id, teamId, transactionBody);
    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx : any) {
    const { idStr } = (ctx as { params: { idStr: string } }).params;

    try {
        const id = Number(idStr);
        let body = await req.json();
        const teamIdStr = body?.teamId ?? new URL(req.url).searchParams.get('teamId');
        const teamId = Number(teamIdStr);

        if (!Number.isInteger(id))
            return fail(400,'Valid id is required');

        if (!Number.isInteger(teamId))
            return fail(400,'Valid teamId is required');

        await controller.deleteTransaction(teamId,  id);
        return ok(204, 'Transaction deleted');
    } catch (error) {
        console.error('DELETE /api/transactions/[id] error:', error);
        return fail(500, 'Failed to delete transaction');
    }
}
