import { NextResponse, NextRequest } from 'next/server'
import {
    buildBudgetFilters,
    createBudget,
    deleteManyBudgets,
    getBudgetByFilter,
    updateBudget
} from "@/lib/services/periodbudgetService";
import {corsHeaders} from "@/lib/cors";

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
        return NextResponse.json({ error: 'userId is required and must be a number' }, { status: 400 })
    }

    try {
        const where = await buildBudgetFilters(userId, categoryIdParam, monthAndYearParam)
        if(where === 'invalid') {
            return NextResponse.json({ error: 'invalid input' }, {status: 500 })
        }
        const expenses = await getBudgetByFilter(where)
        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching budgets:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST (req: NextRequest) {
    const periodBudget = await req.json()

    try{
        const created = await createBudget(periodBudget)
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to create period budget' }, { status: 500 })
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const PeriodBudgetId = Number.parseInt(searchParams.get('periodBudgetId') || '');

    if(isNaN(PeriodBudgetId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await deleteManyBudgets(PeriodBudgetId)
    return NextResponse.json(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing periodBudget ID' }, { status: 400 })
    }

    const updated = await updateBudget(data)
    return NextResponse.json(!!updated)
}
