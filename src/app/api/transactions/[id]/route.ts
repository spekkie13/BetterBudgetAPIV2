import { NextRequest } from 'next/server';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionBody, TransactionInsert, TransactionParams } from "@/db/types/transactionTypes";
import { makeTransactionController } from "@/adapters/controllers/transactionController";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { Team, UserWithTeam } from "@/models";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx : any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { id } = (ctx as { params: { id: string } }).params;
    const sp = new URL(req.url).searchParams;
    if (!Number.isInteger(id))
        return fail(req, 400, 'Invalid id');

    const parsed = TransactionParams.safeParse({
        teamId: sp.get('teamId'),
        type: sp.get('type'),
    });
    if (!parsed.success || !Number.isInteger(team.id))
        return fail(req, 400, 'Invalid teamId');

    let result;
    if (parsed.data.type !== undefined){
        console.log(parsed.data.type);
        result = await controller.selectTransactionsByType(team.id, parsed.data.type);
    }
    else if (id !== undefined)
        result = await controller.getTransaction(team.id, Number(id))
    else
        result = await controller.listAllByTeam(team.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx : any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { idStr } = (ctx as { params: { idStr: string } }).params;
    const id = Number(idStr);

    const params = TransactionParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid params');

    const body = await req.json();
    if (!Number.isInteger(id))
        return fail(req, 400,'Valid id is required');

    if (!Number.isInteger(team.id))
        return fail(req, 400,'Valid teamId is required');

    const parsedBody = TransactionBody.safeParse(body);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body');

    const transactionBody: TransactionInsert = {
        id: params.data.id ?? 0,
        teamId: team.id,
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

    const result = await controller.updateTransaction(id, team.id, transactionBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx : any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { idStr } = (ctx as { params: { idStr: string } }).params;

    try {
        const id = Number(idStr);

        if (!Number.isInteger(id))
            return fail(req, 400,'Valid id is required');

        if (!Number.isInteger(team.id))
            return fail(req, 400,'Valid teamId is required');

        await controller.deleteTransaction(team.id, id);
        return ok(req, 204, 'Transaction deleted');
    } catch (error) {
        console.error('DELETE /api/transactions/[id] error:', error);
        return fail(req, 500, 'Failed to delete transaction');
    }
}
