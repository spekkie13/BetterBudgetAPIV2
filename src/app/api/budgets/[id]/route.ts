import { NextRequest } from "next/server";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import { BudgetService } from "@/adapters/services/budgetService";
import { makeBudgetController } from "@/adapters/controllers/budgetController";
import { BudgetParams, BudgetQuery } from "@/db/types/budgetTypes";
import {preflightResponse} from "@/core/http/cors";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}

export async function GET(req: NextRequest, ctx: any) {
    const { teamId, id, categoryId, month } = (ctx as { params: { teamId: string; id: string; categoryId: string; month: string; } }).params;

    const params = BudgetQuery.safeParse({ teamId: teamId, id: id, categoryId: categoryId, periodMonth: month });
    if (!params.success)
        return fail(req, 400, 'Invalid parameters')

    const result = await controller.getBudgets(
        params.data.teamId,
        params.data.id,
        params.data.categoryId,
        params.data.periodMonth
    )
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

// export async function PUT(req: NextRequest, ctx: any) {
//     const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;
//
//     const parsedParams = BudgetParams.safeParse({ teamId: teamId, id: id });
//     if (!parsedParams.success || parsedParams.data.id === undefined)
//         return fail(req, 400, 'Invalid parameters');
//
//     const body = await req.json().catch(() => ({}));
//     const parsedBody = BudgetBody.safeParse(body);
//     if (!parsedBody.success)
//         return fail(req, 400, 'Invalid body');
//
//     const budgetBody: BudgetInsert = {
//         id: parsedParams.data.id,
//         teamId: parsedParams.data.teamId,
//         categoryId: parsedBody.data.categoryId ?? 0,
//         periodMonth: parsedBody.data.periodMonth ?? "",
//         amountCents: parsedBody.data.amountCents ?? 0,
//         rollover: parsedBody.data.rollover ?? false,
//     }
//
//     const result = await controller.updateBudget(parsedParams.data.teamId, parsedParams.data.id, budgetBody);
//     return isRequestSuccessful(result.status) ?
//         ok(req, result.data) :
//         fail(req, 500, 'Internal Server Error');
// }

export async function DELETE(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const parsedParams = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!parsedParams.success || parsedParams.data.id === undefined)
        return fail(req, 400, 'Invalid parameters');

    const result = await controller.deleteBudget(parsedParams.data.teamId, parsedParams.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}
