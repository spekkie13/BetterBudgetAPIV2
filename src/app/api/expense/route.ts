import { NextRequest, NextResponse } from 'next/server'
import {
    buildExpenseFilters,
    getExpensesByFilter,
    createExpense,
    deleteExpenseById,
    updateExpense,
} from '@/lib/services/expenseService'
import {corsHeaders} from "@/lib/cors";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userIdParam = searchParams.get('userId') ?? ""
    const categoryIdParam = searchParams.get('id') ?? ""
    const monthAndYearParam = searchParams.get('monthAndYear') ?? ""

    const userId = parseInt(userIdParam || '')
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'userId is required and must be a number' }, { status: 400 })
    }

    try {
        const where = buildExpenseFilters(userId, categoryIdParam, monthAndYearParam)
        const expenses = await getExpensesByFilter(where)
        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const expense = await req.json()

    try {
        const created = await createExpense(expense)
        return NextResponse.json(created.id)
    } catch (err) {
        console.error('create error:', err)
        return NextResponse.json({ error: 'Failed to insert expense', status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const expenseId = Number.parseInt(searchParams.get('expenseId') || '')

    if (isNaN(expenseId)) {
        return NextResponse.json({ error: 'invalid ID' }, { status: 400 })
    }

    const result = await deleteExpenseById(expenseId)
    return NextResponse.json(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return NextResponse.json({ error: 'Missing expense ID' }, { status: 400 })
    }

    const updated = await updateExpense(data)
    return NextResponse.json(!!updated)
}
