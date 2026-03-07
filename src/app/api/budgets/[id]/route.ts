import { NextRequest } from "next/server";
import {ok, preflightResponse, getUserDataByToken, toApiResponse} from "@/core/http/ApiHelpers";
import { budgetService } from "@/service/budgetService";
import { UserWithTeam, Team } from "@/models";
import { InvalidTokenError, TeamNotFoundError, AppError } from "@/models/errors";

type IdRouteContext = { params: Promise<{ id: string }> };

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, { params }: IdRouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = await params;
        const budget = await budgetService.getBudgetById(team.id, Number(id));
        return ok(req, budget);
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}

export async function DELETE(req: NextRequest, { params }: IdRouteContext) {
    try {
        const userWithTeam: UserWithTeam = await getUserDataByToken(req);
        if (!userWithTeam)
            throw new InvalidTokenError();

        const team: Team = userWithTeam.team;
        if (!team)
            throw new TeamNotFoundError();

        const { id } = await params;
        await budgetService.deleteBudget(team.id, Number(id));

        return ok(req, {}, "Budget deleted");
    } catch (error) {
        if (error instanceof AppError) {
            return toApiResponse(req, error);
        }
        console.error('Unexpected error:', error);
        throw error;
    }
}
