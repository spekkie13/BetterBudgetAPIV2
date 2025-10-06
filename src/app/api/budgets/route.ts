import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/core/http/cors';
import {BudgetService} from "@/adapters/services/budgetService";
import {makeBudgetController} from "@/adapters/controllers/budgetController";
import {BudgetBody, BudgetParams, BudgetQuery} from "@/db/types/budgetTypes";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const teamId = sp.get("teamId");

    const parsed = BudgetParams.safeParse({ teamId });
    if (!parsed.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid teamId" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const q = BudgetQuery.safeParse({
        teamId: sp.get("teamId"),
        budgetId: sp.get("id"),
        categoryId: sp.get("categoryId"),
        month: sp.get("periodMonth") ?? undefined,
    });

    if (!q.success) {
        return new NextResponse(
            JSON.stringify({ error: "Invalid query" }),
            { status: 400, headers: corsHeaders }
        );
    }

    const result = await controller.getBudgets(q.data.teamId, q.data.id ?? 0, q.data.categoryId ?? 0, q.data.periodMonth ?? "");
    return new NextResponse(JSON.stringify(result.body), {
        status: result.status,
        headers: corsHeaders,
    });
}

export async function POST(req: NextRequest, ctx: any) {
    const { teamId } = (ctx as { params: { teamId: string; } }).params;
    const p = BudgetParams.safeParse({ teamId: teamId });

    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid teamId' }), { status: 400, headers: corsHeaders});

    const body = await req.json().catch(() => ({}));
    const b = BudgetBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'invalid body' }), {status: 400, headers: corsHeaders});

    const budgetBody = {
        teamId: p.data.teamId,
        categoryId: b.data.categoryId ?? 0,
        periodMonth: b.data.periodMonth ?? "",
        amountCents: b.data.amountCents ?? 0,
        rollover: b.data.rollover ?? false,
    }

    const result = await controller.createBudget(p.data.teamId, budgetBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders})
}
