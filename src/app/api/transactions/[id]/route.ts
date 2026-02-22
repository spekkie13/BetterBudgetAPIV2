import { NextRequest } from 'next/server';
import { TransactionBody, TransactionInsert, TransactionParams } from "@/db/types/transactionTypes";
import { ok, fail, preflightResponse, getUserDataByToken } from "@/core/http/ApiHelpers";
import { Team, UserWithTeam } from "@/models";
import {AppError, InvalidTokenError, TeamNotFoundError, ZodValidationError} from "@/models/errors";
import {Response} from "@/core/http/Response";
import {transactionService} from "@/service/transactionService";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx : any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = (ctx as { params: { id: string } }).params;
        const sp = new URL(req.url).searchParams;
        const parsed = TransactionParams.safeParse({
            type: sp.get('type'),
        });

        if (!parsed.success) {
            const errors = parsed.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        let transactions;
        if (parsed.data.type !== undefined && parsed.data.type !== null){
            transactions = await transactionService.selectTransactionsByType(team.id, parsed.data.type);
        }
        else if (id !== undefined)
            transactions = await transactionService.selectTransactionById(team.id, Number(id))
        else
            transactions = await transactionService.selectByTeam(team.id);

        return ok(req, transactions);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function PUT(req: NextRequest, ctx : any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { idStr } = (ctx as { params: { idStr: string } }).params;
        const id = Number(idStr);

        const params = TransactionParams.safeParse({ id: id });
        if (!params.success) {
            const errors = params.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const body = await req.json();
        const parsedBody = TransactionBody.safeParse(body);
        if (!parsedBody.success) {
            const errors = parsedBody.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

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

        const updatedTransaction = await transactionService.updateTransaction(id, team.id, transactionBody);
        return ok(req, updatedTransaction);
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}

export async function DELETE(req: NextRequest, ctx : any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { idStr } = (ctx as { params: { idStr: string } }).params;
        const id = Number(idStr);

        await transactionService.deleteTransaction(team.id, id);
        return ok(req, 204, 'Transaction deleted');
    } catch (error) {
        if (error instanceof AppError) {
            const response : Response<null> = error.toApiResponse(error.statusCode, error.message);
            return fail(req, error.statusCode, response.error);
        }
        console.error('Unexpected error:', error);
        return fail(req, 500, 'Internal server error');
    }
}
