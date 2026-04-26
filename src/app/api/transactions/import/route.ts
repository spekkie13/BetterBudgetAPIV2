import { NextRequest } from "next/server";
import { ok, preflightResponse, getUserDataByToken, toApiResponse } from "@/core/http/ApiHelpers";
import { parseCsvImport } from "@/core/csvImport";
import { transactionService } from "@/service/transactionService";
import { UserWithTeam, Team } from "@/models";
import { AppError, BadRequestError, InvalidTokenError } from "@/models/errors";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function POST(req: NextRequest) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam) throw new InvalidTokenError();

        const team: Team = userWithTeam.team;

        const formData = await req.formData().catch(() => null);
        if (!formData) throw new BadRequestError('Expected multipart/form-data');

        const file = formData.get('file');
        if (!file || typeof file === 'string') throw new BadRequestError('Missing file field');

        const csvText = await (file as File).text();
        if (!csvText.trim()) throw new BadRequestError('CSV file is empty');

        const { valid, errors } = parseCsvImport(csvText, team.id);

        // Column header errors are fatal — nothing to import
        if (errors.length > 0 && valid.length === 0) {
            throw new BadRequestError(errors[0].error);
        }

        const { imported, deduped } = valid.length > 0
            ? await transactionService.importTransactions(valid.map(r => r.input))
            : { imported: 0, deduped: 0 };

        return ok(req, {
            imported,
            deduped,
            failed: errors,
        });
    } catch (error) {
        if (error instanceof AppError) return toApiResponse(req, error);
        console.error('Unexpected error:', error);
        throw error;
    }
}