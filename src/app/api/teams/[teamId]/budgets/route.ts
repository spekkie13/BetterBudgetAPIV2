import { NextRequest } from 'next/server';
import { BudgetQuery } from "@/db/types/budgetTypes";
import { TeamService } from "@/adapters/services/teamService";
import { makeTeamsController } from "@/adapters/controllers/teamsController";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const searchParams = new URL(req.url).searchParams;
    const queryParsed = BudgetQuery.safeParse({ month: searchParams.get('month') });
    if (!queryParsed.success || queryParsed.data.periodMonth === undefined)
        return fail(req, 400, 'Invalid Month');

    const result = await controller.getBudget(team.id, queryParsed.data.periodMonth);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
