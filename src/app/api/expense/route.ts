import { NextRequest, NextResponse } from 'next/server'
import {
    buildExpenseFilters,
    getExpensesByFilter,
    createExpense,
    deleteExpenseById,
    updateExpense,
} from '@/lib/services/expenseService'
import {corsHeaders, jsonWithCors} from "@/lib/cors";

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
        return jsonWithCors({ error: 'Missing user id'}, 400)
    }

    try {
        const where = buildExpenseFilters(userId, categoryIdParam, monthAndYearParam)
        const expenses = await getExpensesByFilter(where)
        return jsonWithCors(expenses)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return jsonWithCors({ error: 'Internal server error' }, 500)
    }
}

export async function POST(req: NextRequest) {
    const expense = await req.json()

    try {
        const created = await createExpense(expense)
        return jsonWithCors(created.id)
    } catch (err) {
        console.error('create error:', err)
        return jsonWithCors({ error: 'Failed to insert expense' }, 500)
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const expenseId = Number.parseInt(searchParams.get('expenseId') || '')

    if (isNaN(expenseId)) {
        return jsonWithCors({ error: 'Missing or invalid expense id'}, 400)
    }

    const result = await deleteExpenseById(expenseId)
    return jsonWithCors(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return jsonWithCors({ error: 'Missing or invalid expense id'}, 400)
    }

    const updated = await updateExpense(data)
    return jsonWithCors(!!updated)
}
