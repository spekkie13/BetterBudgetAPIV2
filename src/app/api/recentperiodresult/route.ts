import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withCors } from '@/lib/cors'

export const GET = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const UserIdParam = searchParams.get('userId');
    const CategoryIdParam = searchParams.get('categoryId');

    const UserId = UserIdParam ? Number.parseInt(UserIdParam) : undefined
    const CategoryId = CategoryIdParam ? Number.parseInt(CategoryIdParam) : undefined

    if ((UserId && isNaN(UserId))
        || (CategoryId && isNaN(CategoryId)))
    {
        return NextResponse.json({ error: 'invalid input'}, { status: 400})
    }

    const where : any = {}

    if (typeof UserId === 'number'){
        where.userId = UserId
    }

    if (typeof CategoryId === 'number'){
        where.id = CategoryId
    }

    try{
        const categories = await prisma.recentPeriodResult.findMany({ where })
        return NextResponse.json(categories)
    }catch(err){
        console.error('Error fetching categories:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
})

export const POST = withCors(async (req: NextRequest) => {
    const recentperiodresult = await req.json()

    try{
        const created = await prisma.recentPeriodResult.create({data: recentperiodresult})
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to insert category', status: 500 })
    }
})

export const DELETE = withCors(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url)
    const RecentPeriodResultId = Number.parseInt(searchParams.get('recentperiodresultid') || '');

    if(isNaN(RecentPeriodResultId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await prisma.category.deleteMany({ where: { id: RecentPeriodResultId } })

    return NextResponse.json(result.count > 0)
})

export const PATCH = withCors(async (req: NextRequest) => {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing recent period result ID' }, { status: 400 })
    }

    const updated = await prisma.recentPeriodResult.update({
        where: { id: data.id },
        data,
    })
    return NextResponse.json(!!updated)
})
