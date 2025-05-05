// app/api/date/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/cors'
import {
    getExpensesGroupedByMonthYear,
    createDate,
    deleteDateById,
    updateDate,
} from '@/lib/services/dateService'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const categoryName = searchParams.get('categoryName') ?? undefined

    try {
        const { error, result } = await getExpensesGroupedByMonthYear(categoryName)

        if (error) {
            const res = NextResponse.json({ error }, { status: 404 })
            Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
            return res
        }

        const res = NextResponse.json(result)
        Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v))
        return res
    } catch (err) {
        console.error(err)
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
