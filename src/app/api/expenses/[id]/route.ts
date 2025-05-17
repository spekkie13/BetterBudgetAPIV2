import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { deleteExpenseById, updateExpense } from '@/lib/services/expenseService';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.id;
        if (!id || isNaN(id)) return jsonWithCors({ error: 'Missing or invalid ID' }, 400);

        const updated = await updateExpense(body);
        return jsonWithCors(updated);
    } catch (error) {
        console.error('Error updating expense:', error);
        return jsonWithCors({ error: 'Failed to update expense' }, 400);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!id || isNaN(id)) return jsonWithCors({ error: 'Missing or invalid ID' }, 400);

        await deleteExpenseById(id);
        return jsonWithCors({ message: 'Expense deleted' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return jsonWithCors({ error: 'Failed to delete expense' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
