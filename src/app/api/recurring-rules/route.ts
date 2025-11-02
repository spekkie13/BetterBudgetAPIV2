import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import { makeRecurringRulesController } from "@/adapters/controllers/recurringRulesController";
import { RecurringRulesService } from "@/adapters/services/recurringRulesService";
import { RecurringRulesBody } from "@/db/types/recurringRulesTypes";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {Team} from "@/models/team";

const svc = new RecurringRulesService();
const controller = makeRecurringRulesController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const result = await controller.listRules(team.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = RecurringRulesBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid Body');

    const ruleBody = {
        teamId: team.id,
        categoryId: parsedBody.data.categoryId,
        name: parsedBody.data.name ?? "",
        amountCents: Number(parsedBody.data.amountCents),
        dayOfMonth: Number(parsedBody.data.dayOfMonth),
        active: parsedBody.data.active ?? true,
    }

    const result = await controller.createRule(team.id, ruleBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}
