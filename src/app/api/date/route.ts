// app/api/date/route.ts

import { NextRequest, NextResponse } from 'next/server'
import {corsHeaders, jsonWithCors} from '@/lib/cors'
import {
    getExpensesGroupedByMonthYear,
    createDate,
    deleteDateById,
    updateDate,
} from '@/lib/services/dateService'

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const userIdParam = searchParams.get('userId')
    const categoryIdParam = searchParams.get('categoryId')

    let userId = userIdParam ? parseInt(userIdParam) : undefined
    let categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined

    if (userIdParam !== null) {
        const parsed = parseInt(userIdParam)
        if (isNaN(parsed)) {
            return jsonWithCors({ error: 'Invalid userId' }, 400)
        }
        userId = parsed
    }

    if (categoryIdParam !== null) {
        const parsed = parseInt(categoryIdParam)
        if (isNaN(parsed)) {
            return jsonWithCors({ error: 'Invalid categoryId' }, 400)
        }
        categoryId = parsed
    }

    try {
        const expenses = await getExpensesGroupedByMonthYear(userId, categoryId)
        if (expenses.length === 0) {
            return jsonWithCors({error: 'no expenses found'} ,404)
        }

        return jsonWithCors(expenses)
    } catch (err) {
        console.error('Date fetch error:', err)
        return jsonWithCors({ error: 'Failed to retrieve date data'}, 500)
    }
}

export async function POST(req: NextRequest) {
    const dateObj = await req.json()

    try {
        const created = await createDate(dateObj)
        return jsonWithCors(created.id)
    } catch (err) {
        console.error('create error:', err)
        return jsonWithCors({ error: 'Failed to insert dateObj'}, 500)
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const dateObjId = Number.parseInt(searchParams.get('dateObjId') || '')

    if (isNaN(dateObjId)) {
        return jsonWithCors({ error: 'Invalid dateObjId' }, 400)
    }

    const result = await deleteDateById(dateObjId)
    return jsonWithCors(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return jsonWithCors({ error: 'Missing date obj ID' }, 400)
    }

    const updated = await updateDate(data)
    return jsonWithCors(!!updated)
}
