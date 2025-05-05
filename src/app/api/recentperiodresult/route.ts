import { NextResponse, NextRequest } from 'next/server'

import {
    buildPeriodFilters,
    createNewPeriodResult,
    deletePeriodResults, findPeriodResultsByFilter,
    updatePeriodResult
} from "@/lib/services/recentperiodresultService";

export async function GET (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const UserIdParam = searchParams.get('userId');
    const CategoryIdParam = searchParams.get('categoryId');

    const UserId = UserIdParam ? Number.parseInt(UserIdParam) : 0
    const CategoryId = CategoryIdParam ? Number.parseInt(CategoryIdParam) : 0

    if ((UserId && isNaN(UserId)) || (CategoryId && isNaN(CategoryId)))
    {
        return NextResponse.json({ error: 'invalid input'}, { status: 400})
    }

    try{
        const where = await buildPeriodFilters(UserId, CategoryId)
        const categories = await findPeriodResultsByFilter(where)
        return NextResponse.json(categories)
    }catch(err){
        console.error('Error fetching categories:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST (req: NextRequest) {
    const recentperiodresult = await req.json()

    try{
        const created = await createNewPeriodResult(recentperiodresult)
        return NextResponse.json(created.id)
    }catch(err){
        console.log('create error:', err)
        return NextResponse.json({ error: 'Failed to insert category', status: 500 })
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const RecentPeriodResultId = Number.parseInt(searchParams.get('recentperiodresultid') || '');

    if(isNaN(RecentPeriodResultId)){
        return NextResponse.json({ error: 'invalid IDs'}, {status: 400})
    }

    const result = await deletePeriodResults(RecentPeriodResultId)

    return NextResponse.json(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing recent period result ID' }, { status: 400 })
    }

    const updated = await updatePeriodResult(data)
    return NextResponse.json(!!updated)
}
