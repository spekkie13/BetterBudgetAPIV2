import {NextRequest, NextResponse} from "next/server";
import {corsHeaders} from "@/core/http/cors";
import {BudgetService} from "@/adapters/services/budgetService";
import {makeBudgetController} from "@/adapters/controllers/budgetController";
import {BudgetBody, BudgetInsert, BudgetParams, BudgetQuery} from "@/db/types/budgetTypes";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(_req: NextRequest, ctx: any) {
    const { teamId, id, categoryId, month } = (ctx as { params: { teamId: string; id: string; categoryId: string; month: string; } }).params;

    const params = BudgetQuery.safeParse({ teamId: teamId, id: id, categoryId: categoryId, periodMonth: month });
    if (!params.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.getBudgets(params.data.teamId, params.data.id, params.data.categoryId, params.data.periodMonth);
    return new NextResponse(result.body === null ? null : JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!p.success || p.data.id === undefined) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = BudgetBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const budgetBody: BudgetInsert = {
        id: p.data.id,
        teamId: p.data.teamId,
        categoryId: b.data.categoryId ?? 0,
        periodMonth: b.data.periodMonth ?? "",
        amountCents: b.data.amountCents ?? 0,
        rollover: b.data.rollover ?? false,
    }

    const result = await controller.updateBudget(p.data.teamId, p.data.id, budgetBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!p.success || p.data.id === undefined) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteBudget(p.data.teamId, p.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}
