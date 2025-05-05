import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
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
        const categories = await prisma.category.findMany({ where })
        return NextResponse.json(categories)
    }catch(err){
        console.error('Error fetching categories:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const category = await req.json()

    try{
        const created = await prisma.category.create({data: category})
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to insert category', status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const CategoryId = Number.parseInt(searchParams.get('categoryId') || '');

    if(isNaN(CategoryId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await prisma.category.deleteMany({ where: { id: CategoryId } })

    return NextResponse.json(result.count > 0)
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing category ID' }, { status: 400 })
    }

    const updated = await prisma.category.update({
        where: { id: data.id },
        data,
    })
    return NextResponse.json(!!updated)
}
