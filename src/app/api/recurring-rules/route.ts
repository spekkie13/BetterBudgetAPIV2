import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import { makeRecurringRulesController } from "@/adapters/controllers/recurringRulesController";
import { RecurringRulesService } from "@/adapters/services/recurringRulesService";
import { RecurringRulesBody, RecurringRulesInsert, RecurringRulesParams, RecurringRulesQuery } from "@/db/types/recurringRulesTypes";

const svc = new RecurringRulesService();
const controller = makeRecurringRulesController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const searchParams = new URL(req.url).searchParams;
    const teamId = searchParams.get("teamId");

    const parsedParams = RecurringRulesParams.safeParse({ teamId: teamId });
    if (!parsedParams.success)
        return fail(req, 400, 'Invalid params');

    const parsedQuery = RecurringRulesQuery.safeParse({
        teamId: teamId,
    });

    if (!parsedQuery.success)
        return fail(req, 400, 'Invalid query');

    const result = await controller.listRules(parsedParams.data.teamId);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = RecurringRulesParams.safeParse({ teamId: teamId });
    if (!params.success)
        return fail(req, 400, 'Invalid Team ID');

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = RecurringRulesBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid Body');

    const ruleBody: RecurringRulesInsert = {
        teamId: params.data.teamId,
        id: params.data.id,
        categoryId: parsedBody.data.categoryId,
        name: parsedBody.data.name ?? "",
        amountCents: Number(parsedBody.data.amountCents),
        dayOfMonth: Number(parsedBody.data.dayOfMonth),
        active: parsedBody.data.active ?? true,
    }

    const result = await controller.createRule(params.data.teamId, ruleBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}
