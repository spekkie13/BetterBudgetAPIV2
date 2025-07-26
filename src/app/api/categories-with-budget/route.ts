import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/cors'
import { createCategoryWithInitialBudget } from '@/lib/services/categoryService'
import { ok, fail } from '@/lib/utils/apiResponse'

// POST /api/categories-with-budget
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Basic shape validation (optional: use zod or schema validation here)
        if (!body.category || !body.budget) return fail('Missing category or budget data', 400)

        const result = await createCategoryWithInitialBudget({
            category: {
                name: body.category.name,
                color: body.category.color,
                icon: body.category.icon,
                userId: body.category.userId,
            },
            budget: {
                amount: body.budget.amount,
                periodId: body.budget.periodId,
                userId: body.budget.userId,
            },
            result: {
                totalSpent: body.result.totalSpent,
                percentageSpent: body.result.percentageSpent,
                userId: body.result.userId,
                periodId: body.result.periodId,
            }
        })

        return ok(result, 'Budget created successfully', 201)
    } catch (error) {
        console.error('Error creating category with budget:', error)
        return fail('Failed to create category and budget', 400)
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
