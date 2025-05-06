import { NextResponse, NextRequest } from 'next/server'
import {
    buildBudgetFilters,
    createBudget,
    deleteManyBudgets,
    getBudgetByFilter,
    updateBudget
} from "@/lib/services/periodbudgetService";
import {corsHeaders, jsonWithCors} from "@/lib/cors";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET (req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const userIdParam = searchParams.get('userId') ?? ""
    const categoryIdParam = searchParams.get('id') ?? ""
    const monthAndYearParam = searchParams.get('monthAndYear') ?? ""

    const userId = parseInt(userIdParam || '')
    if (isNaN(userId)) {
        return jsonWithCors({error: 'usedId is required and must be a number'}, 400)
    }

    try {
        const where = await buildBudgetFilters(userId, categoryIdParam, monthAndYearParam)
        if(where === 'invalid') {
            return jsonWithCors({error: 'invalid input'}, 500)
        }
        const expenses = await getBudgetByFilter(where)
        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching budgets:', error)
        return jsonWithCors({error: 'Internal server error'}, 500)
    }
}

export async function POST (req: NextRequest) {
    const periodBudget = await req.json()

    try{
        const created = await createBudget(periodBudget)
        return jsonWithCors(created.id)
    }catch(err){
        console.log('create error:', err)
        return jsonWithCors({error: 'Failed to create period budget'}, 500)
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const PeriodBudgetId = Number.parseInt(searchParams.get('periodBudgetId') || '');

    if(isNaN(PeriodBudgetId)){
        return jsonWithCors({error: 'invalid periodBudgetId'}, 400)
    }

    const result = await deleteManyBudgets(PeriodBudgetId)
    return jsonWithCors(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return jsonWithCors({error: 'Missing periodBudget ID'}, 400)
    }

    const updated = await updateBudget(data)
    return jsonWithCors(!!updated)
}
