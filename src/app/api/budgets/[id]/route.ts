import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders } from '@/lib/cors'
import { ok, fail } from '@/lib/utils/apiResponse'
import { updateBudget, deleteBudgetById } from '@/lib/services/budgetService'
import { isValid } from '@/lib/helpers'

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const updated = await updateBudget(body)
        return ok(updated, 'Budget updated', 200)
    } catch (error: any) {
        console.error('Error updating budget:', error)
        return fail('Failed to update budget', 400)
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')

    if (!isValid(idParam)) return fail('ID is required', 400)

    const id = parseInt(idParam!)
    if (isNaN(id)) return fail('Invalid ID', 400)

    try {
        await deleteBudgetById(id)
        return ok({ id }, 'Budget deleted', 200)
    } catch (error: any) {
        console.error('Error deleting budget:', error)
        return fail('Failed to delete budget', 400)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
