import { NextResponse, NextRequest } from 'next/server'
import {corsHeaders, jsonWithCors} from '@/lib/cors'
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
        return jsonWithCors({ error: 'invalid input'}, 400)
    }

    try {
        const categories = await getCategoriesByFilters(userId, categoryId)
        if (!categories || categories.length === 0) {
            return jsonWithCors({ error: 'Categories not found' }, 404)
        }

        return jsonWithCors(categories)
    } catch (err) {
        console.error('API error:', err)
        return jsonWithCors({ error: 'API error'}, 500)
    }
}

export async function POST (req: NextRequest) {
    const category = await req.json()

    try {
        const created = await createCategory(category)
        return jsonWithCors(created.id)
    } catch (err) {
        console.error('create error:', err)
        return jsonWithCors({ error: 'Failed to insert category' }, 500)
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const categoryId = Number.parseInt(searchParams.get('categoryId') || '')

    if (isNaN(categoryId)) {
        return jsonWithCors({ error: 'invalid IDs'}, 400)
    }

    const result = await deleteCategoryById(categoryId)
    return jsonWithCors(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return jsonWithCors({ error: 'Missing categoryID' }, 400)
    }

    const updated = await updateCategory(data)
    return jsonWithCors(!!updated)
}
