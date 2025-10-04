import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/utils/cors';
import { BudgetQuery, CreateBudgetBody } from '@/lib/http/budgets/budgetSchemas';
import {BudgetService} from "@/lib/services/budget/budgetService";
import {makeBudgetController} from "@/lib/http/budgets/budgetController";
import {BudgetParams} from "@/lib/http/teams/budgetSchemas";
import {UpdateBudgetBody} from "@/lib/http/budgets/budgetMutateSchemas";
import {BudgetInsert} from "@/app/meta/insertModel";

const svc = new BudgetService();
const controller = makeBudgetController(svc);

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

    const result = await controller.getBudgets(q.data.teamId, q.data.budgetId ?? 0, q.data.categoryId ?? 0, q.data.month ?? "");
    return new NextResponse(JSON.stringify(result.body), {
        status: result.status,
        headers: corsHeaders,
    });
}

export async function PUT(req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const body = await req.json().catch(() => ({}));
    const b = UpdateBudgetBody.safeParse(body);
    if (!b.success) return new NextResponse(JSON.stringify({ error: 'Invalid body' }), { status: 400, headers: corsHeaders });

    const budgetBody: BudgetInsert = {
        id: p.data.id,
        teamId: p.data.teamId,
        categoryId: b.data.categoryId ?? 0,
        periodMonth: b.data.month ?? "",
        amountCents: b.data.amount ?? 0,
        rollover: b.data.rollover ?? false,
    }

    const result = await controller.updateBudget(p.data.teamId, p.data.id, budgetBody);
    return new NextResponse(JSON.stringify(result.body), { status: result.status, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
    try {
        let bodyRaw = await req.json();
        bodyRaw = {
            ...bodyRaw,
            month: bodyRaw.periodMonth,
            amount: bodyRaw.amountCents
        }
        const parsed = CreateBudgetBody.safeParse(bodyRaw);
        if (!parsed.success) {
            return new NextResponse(JSON.stringify({ error: 'Invalid body' }), {
                status: 400,
                headers: corsHeaders,
            });
        }

        const result = await controller.createBudget(parsed.data.teamId, parsed.data);
        return new NextResponse(JSON.stringify(result.body), {
            status: result.status,
            headers: corsHeaders,
        });
    } catch (e) {
        console.error('Error creating budget:', e);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: corsHeaders,
        });
    }
}

export async function DELETE(_req: NextRequest, ctx: any) {
    const { teamId, id } = (ctx as { params: { teamId: string; id: string } }).params;

    const p = BudgetParams.safeParse({ teamId: teamId, id: id });
    if (!p.success) return new NextResponse(JSON.stringify({ error: 'Invalid params' }), { status: 400, headers: corsHeaders });

    const result = await controller.deleteBudget(p.data.teamId, p.data.id);
    return new NextResponse(null, { status: result.status, headers: corsHeaders });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders });
}
