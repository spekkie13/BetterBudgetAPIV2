import { NextRequest, NextResponse } from 'next/server'
import {
    getAllIncomes,
    getIncomeById,
    createIncome,
    updateIncome,
    deleteIncomeById,
} from '@/lib/services/incomeService'
import { jsonWithCors, corsHeaders } from '@/lib/cors'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')

    if (idParam) {
        const id = parseInt(idParam)
        if (isNaN(id)) return jsonWithCors({ error: 'Invalid income ID' }, 400)

        const income = await getIncomeById(id)
        return jsonWithCors(income ?? { error: 'Income not found' }, income ? 200 : 404)
    }

    const incomes = await getAllIncomes()
    return jsonWithCors(incomes)
}

export async function POST(req: NextRequest) {
    const data = await req.json()

    try {
        const created = await createIncome(data)
        return jsonWithCors(created)
    } catch (err) {
        console.error('Create income error:', err)
        return jsonWithCors({ error: 'Failed to create income' }, 500)
    }
}

export async function PATCH(req: NextRequest) {
    const data = await req.json()

    if (!data.id) {
        return jsonWithCors({ error: 'Missing income ID for update' }, 400)
    }

    try {
        const updated = await updateIncome(data)
        return jsonWithCors(updated)
    } catch (err) {
        console.error('Update income error:', err)
        return jsonWithCors({ error: 'Failed to update income' }, 500)
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const idParam = searchParams.get('id')
    const id = parseInt(idParam || '')

    if (isNaN(id)) {
        return jsonWithCors({ error: 'Invalid income ID' }, 400)
    }

    try {
        await deleteIncomeById(id)
        return jsonWithCors({ success: true })
    } catch (err) {
        console.error('Delete income error:', err)
        return jsonWithCors({ error: 'Failed to delete income' }, 500)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
