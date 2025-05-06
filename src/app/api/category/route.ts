import { NextResponse, NextRequest } from 'next/server'
import { corsHeaders } from '@/lib/cors'
import { getCategoriesByFilters, createCategory, deleteCategoryById, updateCategory } from '@/lib/services/categoryService'

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

    const userId = userIdParam ? Number.parseInt(userIdParam) : undefined
    const categoryId = categoryIdParam ? Number.parseInt(categoryIdParam) : undefined

    if ((userId && isNaN(userId)) || (categoryId && isNaN(categoryId))) {
        return NextResponse.json({ error: 'invalid input' }, { status: 400 })
    }

    try {
        const categories = await getCategoriesByFilters(userId, categoryId)

        if (!categories || categories.length === 0) {
            return NextResponse.json({ error: 'Categories not found' }, { status: 404 })
        }

        const response = NextResponse.json(categories)
        Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v))
        return response
    } catch (err) {
        console.error('API error:', err)
        const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
        Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v))
        return response
    }
}

export async function POST (req: NextRequest) {
    const category = await req.json()

    try {
        const created = await createCategory(category)
        return NextResponse.json(created.id)
    } catch (err) {
        console.error('create error:', err)
        return NextResponse.json({ error: 'Failed to insert category', status: 500 })
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const categoryId = Number.parseInt(searchParams.get('categoryId') || '')

    if (isNaN(categoryId)) {
        return NextResponse.json({ error: 'invalid IDs' }, { status: 400 })
    }

    const result = await deleteCategoryById(categoryId)
    return NextResponse.json(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return NextResponse.json({ error: 'Missing category ID' }, { status: 400 })
    }

    const updated = await updateCategory(data)
    return NextResponse.json(!!updated)
}
