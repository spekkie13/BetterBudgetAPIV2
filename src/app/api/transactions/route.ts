import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from '@/core/http/Response';
import { makeTransactionController } from '@/adapters/controllers/transactionController';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionParams } from "@/db/types/transactionTypes";
import { preflightResponse } from "@/core/http/cors";
import { Team, UserWithTeam } from "@/models";
import { getUserByToken } from "@/core/http/requestHelpers";
import { mapToInsert, parseTransactionBody } from "@/core/transaction";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const sp = new URL(req.url).searchParams;
    const parsed = TransactionParams.safeParse({
        type: sp.get('type'),
    });
    if (!parsed.success)
        return fail(req, 400, 'Invalid parameters');

    let result;
    if (parsed.data.type !== undefined)
        result = await controller.selectTransactionsByType(team.id, parsed.data.type);
    else
        result = await controller.listAllByTeam(team.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;
    try {
        const body = await req.json();
        const reqDto = parseTransactionBody(body);
        if (!reqDto)
            return fail(req, 400, 'Bad Request');

        const insert = mapToInsert(team.id, reqDto);
        const created = await controller.createTransaction(team.id, insert);

        const resDto = {
            ...reqDto,
            id: created.data?.id,
            teamId: team.id,
            createdAt: created.data?.createdAt.toISOString(),
            updatedAt: created.data?.updatedAt.toISOString(),
        };
        return ok(req, resDto, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
