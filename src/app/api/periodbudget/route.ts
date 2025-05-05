import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {withCors} from "@/lib/cors";

export const GET = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)

    const userIdParam = searchParams.get('userId')
    const categoryIdParam = searchParams.get('id') // category ID
    const monthAndYearParam = searchParams.get('monthAndYear')

    const userId = parseInt(userIdParam || '')
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'userId is required and must be a number' }, { status: 400 })
    }

    const where: any = {
        userId,
    }

    if(monthAndYearParam) {
        const [monthStr, yearStr] = decodeURIComponent(monthAndYearParam).split('-')
        const month = parseInt(monthStr)
        const year = parseInt(yearStr)

        if (isNaN(month) || isNaN(year)){
            return NextResponse.json({ error: 'Invalid date format'}, {status: 500})
        }

        where.month = month
        where.year = year
    }

    if (categoryIdParam) {
        const categoryId = parseInt(categoryIdParam)
        if (!isNaN(categoryId)) {
            where.categoryId = categoryId
        }
    }

    try {
        const expenses = await prisma.periodBudget.findMany({ where })
        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})

export const POST = withCors(async (req: NextRequest) => {
    const periodBudget = await req.json()

    try{
        const created = await prisma.periodBudget.create({data: periodBudget})
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to periodBudget category', status: 500 })
    }
})

export const DELETE = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const PeriodBudgetId = Number.parseInt(searchParams.get('periodBudgetId') || '');

    if(isNaN(PeriodBudgetId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await prisma.periodBudget.deleteMany({ where: { id: PeriodBudgetId } })
    return NextResponse.json(result.count > 0)
})

export const PATCH = withCors(async (req: NextRequest) => {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing periodBudget ID' }, { status: 400 })
    }

    const updated = await prisma.periodBudget.update({
        where: { id: data.id },
        data,
    })
    return NextResponse.json(!!updated)
})
