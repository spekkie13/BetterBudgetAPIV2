import { NextRequest } from 'next/server';
import {ok, preflightResponse, getUserDataByToken, toApiResponse} from '@/core/http/ApiHelpers';
import { TransactionParams } from "@/db/types/transactionTypes";
import { Team, UserWithTeam } from "@/models";
import { mapToInsert, parseTransactionBody } from "@/core/transaction";
import {AppError, BadRequestError, InvalidTokenError, ZodValidationError} from "@/models/errors";
import {transactionService} from "@/service/transactionService";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;

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
        if (parsed.data.type !== undefined && parsed.data.type !== null)
            transactions = await transactionService.selectTransactionsByType(team.id, parsed.data.type);
        else
            transactions = await transactionService.selectByTeam(team.id);

        return ok(req, transactions);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        const body = await req.json();
        let reqDto;
        try {
            reqDto = parseTransactionBody(body);
        } catch (e: any) {
            throw new BadRequestError(e?.message ?? "Bad Request");
        }

        if (!reqDto)
            throw new BadRequestError('Could not parse transaction body');

        const insert = mapToInsert(team.id, reqDto);
        const created = await transactionService.createTransaction(insert);

        const resDto = {
            ...reqDto,
            id: created.id,
            teamId: team.id,
            createdAt: created.createdAt.toISOString(),
            updatedAt: created.updatedAt.toISOString(),
        };

        return ok(req, resDto);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}
