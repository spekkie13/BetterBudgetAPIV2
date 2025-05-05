import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DateObj } from '@/models/dateObj'
import {Expense} from "@/models/expense";
import {withCors} from "@/lib/cors";

export const GET = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const categoryName = searchParams.get('categoryName')

    try {
        let expenses : any[] = []

        if (categoryName) {
            const category = await prisma.category.findFirst({
                where: { Name: categoryName },
            })

            if (!category) {
                return NextResponse.json({ error: 'Category not found' }, { status: 404 })
            }

            expenses = await prisma.expense.findMany({
                where: { categoryId: category.id },
                select: { Date: true },
            })
        } else {
            expenses = await prisma.expense.findMany({
                select: { Date: true },
            })
        }

        // Build unique (month, year) combinations
        const seen = new Set<string>()
        const result: DateObj[] = []

        expenses.forEach((e: Expense, index) => {
            // Fix: Use correct Date constructor: year, monthIndex (0-based), day
            const date = new Date(e.date.year, e.date.month - 1, e.date.day)

            const month = date.getMonth() + 1
            const year = date.getFullYear()
            const day = date.getDate()

            const key = `${month}-${year}`

            if (!seen.has(key)) {
                seen.add(key)
                result.push({ day, month, year, id: index })
            }
        })

        // Sort by year and month
        result.sort((a, b) => (a.year !== b.year ? a.year - b.year : a.month - b.month))

        return NextResponse.json(result)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to retrieve date data' }, { status: 500 })
    }
})

export const POST = withCors(async (req: NextRequest) => {
    const dateObj = await req.json()

    try{
        const created = await prisma.dateObj.create({data: dateObj})
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to insert dateObj', status: 500 })
    }
})

export const DELETE = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const DateObjId = Number.parseInt(searchParams.get('dateObjId') || '');

    if(isNaN(DateObjId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await prisma.category.deleteMany({ where: { id: DateObjId } })
    return NextResponse.json(result.count > 0)
})

export const PATCH = withCors(async (req: NextRequest) => {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing date obj ID' }, { status: 400 })
    }

    const updated = await prisma.dateObj.update({
        where: { id: data.id },
        data,
    })
    return NextResponse.json(!!updated)
})
