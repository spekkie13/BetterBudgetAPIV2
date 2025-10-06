import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import { ok, fail } from '@/core/http/Response';
import {makeTransactionController} from '@/adapters/controllers/transactionController';
import {TransactionService} from '@/adapters/services/transactionService';
import {TransactionInsert, TransactionParams} from "@/db/types/transactionTypes";

const svc = new TransactionService();
const controller = makeTransactionController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const parsed = TransactionParams.safeParse({
        teamId: Number(searchParams.get('teamId') ?? ""),
    });

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error }, { status: 400, headers: corsHeaders });
    }

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const { status, body } = await controller.listAllByTeam(parsed.data.teamId);

    return NextResponse.json(body, { status, headers: corsHeaders });
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

        const requireInt = (ok: boolean, msg: string) => { if (!ok) return fail(400, msg); };

        if (Number.isNaN(postedAt.getTime())) return fail(400,'Invalid postedAt/date/createdAt');
        if (!Number.isInteger(teamId))        return fail(400,'Invalid teamId');
        if (!Number.isFinite(amountCents))    return fail(400,'Invalid amountCents');

        const isTransfer = Boolean(body?.isTransfer) ||
            (Number.isInteger(fromAccountId) && Number.isInteger(toAccountId));

        if (isTransfer) {
            requireInt(Number.isInteger(fromAccountId) && Number.isInteger(toAccountId), 'Invalid account ids');
            if (fromAccountId === toAccountId) return fail(400,'fromAccountId and toAccountId must differ');
            if (amountCents <= 0)              return fail(400,'Transfer amountCents must be > 0');

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
                createdAt: body.createdAt,
                updatedAt: body.updatedAt,
                deletedAt: body.deletedAt,
                currency: body?.currency,
                isTransfer: true,
                transferGroupId: body?.transferGroupId ?? null,
                id: 0,
            })

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
                createdAt: body.createdAt,
                updatedAt: body.updatedAt,
                deletedAt: body.deletedAt,
                currency: body?.currency,
                isTransfer: true,
                transferGroupId: outLeg.body.id,
                id: 0,
            });

            return ok(result, 'Transfer created', 201);
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

        const created = await controller.createTransaction(teamId, transactionData);
        return ok(created, 'Transaction created', 201);
    } catch (error) {
        console.error('POST /api/transactions error:', error);
        return fail(500, 'Internal server error');
    }
}
