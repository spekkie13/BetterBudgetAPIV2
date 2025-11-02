import { NextRequest } from "next/server";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { BudgetService } from "@/adapters/services/budgetService";
import { makeBudgetController } from "@/adapters/controllers/budgetController";
import { BudgetQuery } from "@/db/types/budgetTypes";
import {preflightResponse} from "@/core/http/cors";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {Team} from "@/models/team";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
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
        fail(req, 500, 'Internal Server Error');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const result = await controller.deleteBudget(team.id, Number(id));
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}
