import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from '@/core/http/Response';
import { makeTransactionController } from '@/adapters/controllers/transactionController';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionParams } from "@/db/types/transactionTypes";
import {preflightResponse} from "@/core/http/cors";
import {Team, UserWithTeam} from "@/models";
import {getUserByToken} from "@/core/http/requestHelpers";

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
    if (!parsed.success || !Number.isInteger(team.id))
        return fail(req, 400, 'Invalid teamId');

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
        const int = (v: unknown) => {
            const n = Number(v);
            return Number.isInteger(n) ? n : NaN;
        };
        const postedAtStr: string = body?.postedAt ?? body?.date ?? body?.createdAt ?? new Date().toISOString();
        const postedAt = new Date(postedAtStr);

        const fromAccountId = int(body?.fromAccountId ?? body?.fromAccountID);
        const toAccountId   = int(body?.toAccountId   ?? body?.toAccountID);
        const accountId     = int(body?.accountId ?? body?.fromAccountId ?? body?.fromAccountID);
        const amountCents   = Number(body?.amountCents);

        const requireInt = (ok: boolean, msg: string) => {
            if (!ok)
                return fail(req, 400, msg);
        };

        if (Number.isNaN(postedAt.getTime()))
            return fail(req, 400,'Invalid postedAt/date/createdAt');

        if (!Number.isInteger(team.id))
            return fail(req, 400,'Invalid teamId');

        if (!Number.isFinite(amountCents))
            return fail(req, 400,'Invalid amountCents');

        const isTransfer = Boolean(body?.isTransfer) ||
            (Number.isInteger(fromAccountId) && Number.isInteger(toAccountId));

        if (isTransfer) {
            requireInt(Number.isInteger(fromAccountId) && Number.isInteger(toAccountId), 'Invalid account ids');

            if (fromAccountId === toAccountId)
                return fail(req, 400,'fromAccountId and toAccountId must differ');

            if (amountCents <= 0)
                return fail(req, 400,'Transfer amountCents must be > 0');

            //create leg 1
            const outLeg = await controller.createTransaction(team.id, {
                teamId: team.id,
                accountId,
                amountCents: amountCents * -1,
                postedAt: postedAt,
                categoryId: body.categoryId ?? null,
                payee: body?.payee ?? null,
                memo: body?.description ?? body?.memo ?? null,
                createdBy: body?.createdBy ?? null,
                createdAt: body.createdAt ?? new Date().toISOString(),
                updatedAt: body.updatedAt ?? new Date().toISOString(),
                deletedAt: body.deletedAt,
                currency: body?.currency,
                isTransfer: true,
                transferGroupId: body?.transferGroupId ?? 0,
                id: 0,
            })

            //create leg 2
            const result = await controller.createTransaction(team.id, {
                teamId: team.id,
                accountId,
                amountCents,
                postedAt: postedAt,
                categoryId: null,
                payee: null,
                memo: body?.memo ?? 'Transfer',
                createdBy: body?.createdBy ?? null,
                createdAt: postedAt,
                updatedAt: postedAt,
                deletedAt: body.deletedAt ?? null,
                currency: body?.currency,
                isTransfer: true,
                transferGroupId: outLeg.data?.id ?? null,
                id: 0,
            });

            return isRequestSuccessful(result.status) ?
                ok(req, result.data) :
                fail(req, 500, 'Internal Server Error...');
        }

        requireInt(Number.isInteger(accountId), 'Invalid accountId');

        const { id: _ignore, ...rest } = body ?? {};

        // build a safe row (Dates for timestamps; omit createdAt/updatedAt so defaultNow() fills them)
        const row = {
            teamId: Number(rest.teamId),
            accountId: Number(rest.accountId ?? rest.fromAccountId ?? rest.fromAccountID),
            amountCents: Number(rest.amountCents),
            currency: rest.currency ?? 'EUR',
            postedAt: new Date(rest.postedAt ?? rest.date ?? rest.createdAt), // must be Date
            payee: rest.payee ?? null,
            memo: rest.memo ?? rest.description ?? null,
            categoryId: rest.categoryId != null ? Number(rest.categoryId) : null,
            isTransfer: !!rest.isTransfer,
            transferGroupId: rest.transferGroupId ?? null,
            createdBy: Number.isInteger(rest.createdBy) ? Number(rest.createdBy) : null,
            // createdAt/updatedAt omitted → defaultNow()
            deletedAt: rest.deletedAt ? new Date(rest.deletedAt) : null,
        };

        const created = await controller.createTransaction(team.id, row);
        return ok(req, created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
