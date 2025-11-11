import { NextRequest } from "next/server";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { BudgetService } from "@/adapters/services/budgetService";
import { makeBudgetController } from "@/adapters/controllers/budgetController";
import { BudgetQuery } from "@/db/types/budgetTypes";
import { UserWithTeam, Team } from "@/models";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;

    const { id, categoryId, month } = (ctx as { params: { id: string; categoryId: string; month: string; } }).params;

    const params = BudgetQuery.safeParse({ id: id, categoryId: categoryId, periodMonth: month });
    if (!params.success)
        return fail(req, 400, 'Invalid parameters')

    const result = await controller.getBudgets(
        team.id,
        params.data.id,
        params.data.categoryId,
        params.data.periodMonth
    )
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function DELETE(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const { id } = (ctx as { params: { id: string } }).params;

    const result = await controller.deleteBudget(team.id, Number(id));
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}
