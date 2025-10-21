import { NextRequest } from 'next/server';
import { BudgetService } from "@/adapters/services/budgetService";
import { makeBudgetController } from "@/adapters/controllers/budgetController";
import {BudgetBody, BudgetParams, BudgetQuery} from "@/db/types/budgetTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const teamId = sp.get("teamId");

    const parsed = BudgetParams.safeParse({ teamId });
    if (!parsed.success)
        return fail(req, 400, 'Invalid Team ID');

    const parsedQuery = BudgetQuery.safeParse({
        teamId: sp.get("teamId"),
        budgetId: sp.get("id"),
        categoryId: sp.get("categoryId") ?? 0,
        month: sp.get("periodMonth"),
    });
    if (!parsedQuery.success)
        return fail(req, 400, 'Invalid Query');

    const result = await controller.getBudgets(
        parsedQuery.data.teamId,
        parsedQuery.data.id,
        parsedQuery.data.categoryId,
        parsedQuery.data.periodMonth
    );

    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; } }).params;
    const p = BudgetParams.safeParse({ teamId: teamId });
    if (!p.success)
        return fail(req, 400, 'Invalid Team ID');

    const body = await req.json().catch(() => ({}));
    const b = BudgetBody.safeParse(body);
    if (!b.success)
        return fail(req, 400, 'Invalid Body');

    const budgetBody = {
        teamId: p.data.teamId,
        categoryId: b.data.categoryId ?? 0,
        periodMonth: b.data.periodMonth ?? "",
        amountCents: b.data.amountCents ?? 0,
        rollover: b.data.rollover ?? false,
    }

    const result = await controller.createBudget(p.data.teamId, budgetBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const teamId = sp.get("teamId");
    const id = sp.get("id");
    const parsedParams = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!parsedParams.success || parsedParams.data.id === undefined)
        return fail(req, 400, 'Invalid parameters');

    const body = await req.json().catch(() => ({}));
    const parsedBody = BudgetBody.safeParse(body);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body');

    const budgetBody = {
        amountCents: parsedBody.data.amountCents ?? 0,
        rollover: parsedBody.data.rollover ?? false,
    }
    console.log(budgetBody);
    const result = await controller.updateBudget(parsedParams.data.teamId, parsedParams.data.id, budgetBody);
    console.log(result);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}
