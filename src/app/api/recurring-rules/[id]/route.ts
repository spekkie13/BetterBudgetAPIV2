import { NextRequest } from 'next/server';
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { preflightResponse } from "@/core/http/cors";
import {RecurringRulesService} from "@/adapters/services/recurringRulesService";
import {makeRecurringRulesController} from "@/adapters/controllers/recurringRulesController";
import {RecurringRulesBody, RecurringRulesInsert, RecurringRulesParams} from "@/db/types/recurringRulesTypes";

const svc = new RecurringRulesService();
const controller = makeRecurringRulesController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = RecurringRulesParams.safeParse({ teamId: teamId, id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid parameters')

    const result = await controller.getRule(params.data.teamId, params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.message);
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const params = RecurringRulesParams.safeParse({ teamId: teamId, id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid parameters')

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = RecurringRulesBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body')

    const ruleBody: RecurringRulesInsert = {
        teamId: params.data.teamId,
        id: params.data.id,
        categoryId: parsedBody.data.categoryId,
        name: parsedBody.data.name ?? "",
        amountCents: Number(parsedBody.data.amountCents),
        dayOfMonth: Number(parsedBody.data.dayOfMonth),
        active: parsedBody.data.active ?? true,
    }
    const result = await controller.updateRule(params.data.teamId, parsedBody.data.id, ruleBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = RecurringRulesParams.safeParse({ teamId: teamId, id: id });
    if (!p.success || p.data.id === null || p.data.id === undefined)
        return fail(req, 400, 'Invalid parameters')

    const result = await controller.deleteRule(p.data.teamId, p.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}
