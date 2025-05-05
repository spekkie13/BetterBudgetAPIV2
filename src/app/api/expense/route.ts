import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const userIdParam = searchParams.get('userId')
    const categoryIdParam = searchParams.get('id') // category ID
    const monthAndYearParam = searchParams.get('monthAndYear')

    // Parse and validate required base param
    const userId = parseInt(userIdParam || '')
    if (isNaN(userId)) {
        return NextResponse.json({ error: 'userId is required and must be a number' }, { status: 400 })
    }

    // Build dynamic filter object
    const where: any = {
        userId,
    }

    if (categoryIdParam) {
        const categoryId = parseInt(categoryIdParam)
        if (!isNaN(categoryId)) {
            where.categoryId = categoryId
        }
    }

    if (monthAndYearParam) {
        try {
            const [monthStr, yearStr] = decodeURIComponent(monthAndYearParam).split('-')
            const month = parseInt(monthStr)
            const year = parseInt(yearStr)

            if (isNaN(month) || isNaN(year)){
                return NextResponse.json({ error: 'Invalid date format'}, {status: 500})
            }

            const from = new Date(year, month - 1, 1)
            const to = new Date(year, month, 1)

            where.Date = {
                gte: from,
                lt: to,
            }
        } catch {
            return NextResponse.json({ error: 'Invalid monthAndYear format. Expected MM-YYYY.' }, { status: 400 })
        }
    }

    try {
        const expenses = await prisma.expense.findMany({ where })
        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const expense = await req.json()

    try{
        const created = await prisma.expense.create({data: expense})
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to insert category', status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const ExpenseId = Number.parseInt(searchParams.get('expenseId') || '');

    if(isNaN(ExpenseId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await prisma.expense.deleteMany({ where: { id: ExpenseId } })
    return NextResponse.json(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing expense ID' }, { status: 400 })
    }

    const updated = await prisma.expense.update({
        where: { id: data.id },
        data,
    })
    return NextResponse.json(!!updated)
}
