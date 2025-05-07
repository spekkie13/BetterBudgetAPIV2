// app/api/date/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/cors'
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
            const res = NextResponse.json({ error: 'Invalid userId' }, { status: 400 })
            Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
            return res
        }
        userId = parsed
    }

    if (categoryIdParam !== null) {
        const parsed = parseInt(categoryIdParam)
        if (isNaN(parsed)) {
            const res = NextResponse.json({ error: 'Invalid categoryId' }, { status: 400 })
            Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
            return res
        }
        categoryId = parsed
    }

    try {
        const { error, result } = await getExpensesGroupedByMonthYear(userId, categoryId)
        if (error) {
            const res = NextResponse.json({ error }, { status: 404 })
            Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
            return res
        }

        const res = NextResponse.json(result)
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
        return res
    } catch (err) {
        console.error('Date fetch error:', err)
        const res = NextResponse.json({ error: 'Failed to retrieve date data' }, { status: 500 })
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
        return res
    }
}

export async function POST(req: NextRequest) {
    const dateObj = await req.json()

    try {
        const created = await createDate(dateObj)
        return NextResponse.json(created.id)
    } catch (err) {
        console.error('create error:', err)
        return NextResponse.json({ error: 'Failed to insert dateObj', status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const dateObjId = Number.parseInt(searchParams.get('dateObjId') || '')

    if (isNaN(dateObjId)) {
        return NextResponse.json({ error: 'invalid ID' }, { status: 400 })
    }

    const result = await deleteDateById(dateObjId)
    return NextResponse.json(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return NextResponse.json({ error: 'Missing date obj ID' }, { status: 400 })
    }

    const updated = await updateDate(data)
    return NextResponse.json(!!updated)
}
