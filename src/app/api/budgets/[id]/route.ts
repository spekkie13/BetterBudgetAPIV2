import { NextRequest } from "next/server";
import { ok, fail, preflightResponse, getUserDataByToken } from "@/core/http/ApiHelpers";
import { budgetService } from "@/service/budgetService";
import { BudgetQuery } from "@/db/types/budgetTypes";
import { UserWithTeam, Team } from "@/models";
import { InvalidTokenError, TeamNotFoundError, AppError, ZodValidationError } from "@/models/errors";

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { categoryId, month } = (ctx as { params: { categoryId: string; month: string; } }).params;

        const params = BudgetQuery.safeParse({ categoryId: categoryId, periodMonth: month });
        if (!params.success) {
            const errors = params.error.issues.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }));
            throw new ZodValidationError(errors);
        }

        const budgets = await budgetService.getBudgets(
            team.id,
            params.data.periodMonth,
            params.data.categoryId
        )

        return ok(req, budgets);
    } catch (error) {
        if (error instanceof AppError) {
            return error.toApiResponse(error.statusCode, error.message);
        }

        console.log('unexpected error: ', error);
        return fail(req, 500, 'Internal server error');
    }

}

export async function DELETE(req: NextRequest, ctx: any) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = (ctx as { params: { id: string } }).params;
        await budgetService.deleteBudget(team.id, Number(id));

        return ok(req, {}, "Budget deleted");
    } catch (error) {
        if (error instanceof AppError) {
            return error.toApiResponse(error.statusCode, error.message);
        }

        console.log('unexpected error: ', error);
        return fail(req, 500, 'Internal server error');
    }
}
