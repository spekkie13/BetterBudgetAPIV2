import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from '@/core/http/Response';
import { makeTransactionController } from '@/adapters/controllers/transactionController';
import { TransactionService } from '@/adapters/services/transactionService';
import { TransactionInsert, TransactionParams } from "@/db/types/transactionTypes";
import {preflightResponse} from "@/core/http/cors";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = TransactionParams.safeParse({
        teamId: sp.get('teamId'),
        type: sp.get('type'),
    });
    if (!parsed.success || !Number.isInteger(parsed.data.teamId))
        return fail(req, 400, 'Invalid teamId');

    let result;
    if (parsed.data.type !== undefined)
        result = await controller.selectTransactionsByType(parsed.data.teamId, parsed.data.type);
    else
        result = await controller.listAllByTeam(parsed.data.teamId);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const int = (v: unknown) => {
            const n = Number(v);
            return Number.isInteger(n) ? n : NaN;
        };
        const postedAtStr = body?.postedAt ?? body?.date ?? body?.createdAt;
        const postedAt = new Date(postedAtStr ?? NaN);

        const fromAccountId = int(body?.fromAccountId ?? body?.fromAccountID);
        const toAccountId   = int(body?.toAccountId   ?? body?.toAccountID);
        const accountId     = int(body?.accountId ?? body?.fromAccountId ?? body?.fromAccountID);
        const teamId        = int(body?.teamId);
        const amountCents   = Number(body?.amountCents);

        const requireInt = (ok: boolean, msg: string) => {
            if (!ok)
                return fail(req, 400, msg);
        };

        if (Number.isNaN(postedAt.getTime()))
            return fail(req, 400,'Invalid postedAt/date/createdAt');

        if (!Number.isInteger(teamId))
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
            const outLeg = await controller.createTransaction(teamId, {
                teamId,
                accountId,
                amountCents: amountCents * -1,
                postedAt: postedAtStr,
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
            console.log(outLeg)
            //create leg 2
            const result = await controller.createTransaction(teamId, {
                teamId,
                accountId,
                amountCents,
                postedAt: postedAtStr,
                categoryId: null,
                payee: null,
                memo: body?.memo ?? 'Transfer',
                createdBy: body?.createdBy ?? null,
                createdAt: body.createdAt ?? new Date().toISOString(),
                updatedAt: body.updatedAt ?? new Date().toISOString(),
                deletedAt: body.deletedAt,
                currency: body?.currency,
                isTransfer: true,
                transferGroupId: outLeg.data?.id ?? null,
                id: 0,
            });

            console.log(result);
            return isRequestSuccessful(result.status) ?
                ok(req, result.data) :
                fail(req, 500, 'Internal Server Error...');
        }

        requireInt(Number.isInteger(accountId), 'Invalid accountId');

        const transactionData: TransactionInsert = {
            teamId,
            accountId,
            amountCents,
            postedAt: postedAtStr,
            categoryId: body.categoryId ?? null,
            payee: body?.payee ?? null,
            memo: body?.description ?? body?.memo ?? null,
            createdBy: body?.createdBy ?? null,
            createdAt: body.createdAt,
            updatedAt: body.updatedAt,
            deletedAt: body.deletedAt,
            currency: body?.currency,
            isTransfer: body?.isTransfer ?? false,
            transferGroupId: body?.transferGroupId ?? null,
            id: 0,
        };

        console.log(transactionData);
        const created = await controller.createTransaction(teamId, transactionData);
        console.log(created);
        return ok(req, created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:');
        return fail(req, 500, 'Internal server error');
    }
}
