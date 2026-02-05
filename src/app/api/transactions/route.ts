import { NextRequest } from 'next/server';
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from '@/core/http/ApiHelpers';
import { makeTransactionController } from '@/adapters/controllers/transactionController';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionParams } from "@/db/types/transactionTypes";
import { Team, UserWithTeam } from "@/models";
import { mapToInsert, parseTransactionBody } from "@/core/transaction";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

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
        fail(req, result.status, result.error);
}

export async function POST(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const body = await req.json();
    console.log(body);
    let reqDto;
    try {
        reqDto = parseTransactionBody(body);
    } catch (e: any) {
        console.error("[parseTransactionBody] error:", e);
        return fail(req, 400, e?.message ?? "Bad Request");
    }

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
    return isRequestSuccessful(created.status) ?
        ok(req, resDto) :
        fail(req, 400, 'Bad Request');
}
