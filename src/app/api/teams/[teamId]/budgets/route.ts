import { NextRequest } from 'next/server';
import { BudgetQuery } from "@/db/types/budgetTypes";
import { TeamService } from "@/adapters/services/teamService";
import { makeTeamsController } from "@/adapters/controllers/teamsController";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {Team} from "@/models/team";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam = await getUserByToken(req.headers.get('authorization'));
    const team: Team = userWithTeam.team;

    const sp = new URL(req.url).searchParams;
    const queryParsed = BudgetQuery.safeParse({ month: sp.get('month') });
    if (!queryParsed.success || queryParsed.data.periodMonth === undefined)
        return fail(req, 400, 'Invalid Month');

    const result = await controller.getBudget(team.id, queryParsed.data.periodMonth);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
