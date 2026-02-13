import { NextRequest } from 'next/server';
import { BudgetService } from "@/adapters/services/budgetService";
import { makeBudgetController } from "@/adapters/controllers/budgetController";
import { BudgetBody, BudgetParams, BudgetQuery } from "@/db/types/budgetTypes";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const sp = new URL(req.url).searchParams;

    const parsedQuery = BudgetQuery.safeParse({
        budgetId: sp.get("id"),
        categoryId: sp.get("categoryId") ?? 0,
        periodMonth: sp.get("periodMonth"),
    });
    if (!parsedQuery.success)
        return fail(req, 400, 'Invalid Query');

    const result = await controller.getBudgets(
        team.id,
        parsedQuery.data.id,
        parsedQuery.data.categoryId,
        parsedQuery.data.periodMonth
    );

    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    let body = await req.json().catch(() => ({}));
    body = { ...body, teamId: team.id };
    const parsedBody = BudgetBody.safeParse(body);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid Body');

    const budgetBody = {
        teamId: team.id,
        categoryId: parsedBody.data.categoryId ?? 0,
        periodMonth: parsedBody.data.periodMonth ?? "",
        amountCents: parsedBody.data.amountCents ?? 0,
        rollover: parsedBody.data.rollover ?? false,
    }

    const result = await controller.createBudget(team.id, budgetBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const sp = new URL(req.url).searchParams;
    const id = sp.get("id");
    const parsedParams = BudgetParams.safeParse({ id: id });
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

    const result = await controller.updateBudget(team.id, parsedParams.data.id, budgetBody);

    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}
