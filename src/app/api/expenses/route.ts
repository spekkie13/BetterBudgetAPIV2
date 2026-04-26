import { NextRequest } from "next/server";
import { ok, preflightResponse, getUserDataByToken, toApiResponse } from "@/core/http/ApiHelpers";
import { mapToInsert, parseTransactionBody } from "@/core/transaction";
import { transactionService } from "@/service/transactionService";
import { UserWithTeam, Team } from "@/models";
import { AppError, BadRequestError, InvalidTokenError } from "@/models/errors";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        const transactions = await transactionService.selectTransactionsByType(team.id, 'expense');
        return ok(req, transactions);
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        const body = await req.json().catch(() => ({}));

        let reqDto;
        try {
            reqDto = parseTransactionBody({ ...body, transactionType: 'expense' });
        } catch (e: any) {
            throw new BadRequestError(e?.message ?? 'Bad Request');
        }

        if (!reqDto) throw new BadRequestError('Could not parse transaction body');

        const created = await transactionService.createTransaction(mapToInsert(team.id, reqDto));
        return ok(req, { ...reqDto, id: created.id, teamId: team.id, createdAt: created.createdAt, updatedAt: created.updatedAt });
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}