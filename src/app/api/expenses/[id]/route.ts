import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { deleteExpenseById, updateExpense } from '@/lib/services/expenseService';
import {isValid} from "@/lib/helpers";
import { ok, fail } from '@/lib/utils/apiResponse'

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.id;
        if (!isValid(id)) return fail('Please provide a valid ID', 400)

        const updated = await updateExpense(body);
        return ok(updated);
    } catch (error) {
        console.error('Error updating expense:', error);
        return fail('Failed to update expense', 400)
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!isValid(id)) return fail('Please provide a valid ID', 400)

        const idParam = parseInt(id!)
        await deleteExpenseById(idParam);
        return ok({}, 'Expense deleted');
    } catch (error) {
        console.error('Error deleting expense:', error);
        return fail('Failed to delete expense', 400)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
