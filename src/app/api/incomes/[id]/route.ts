import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { deleteIncomeById, updateIncome } from '@/lib/services/incomeService';
import { isValid } from '@/lib/helpers'
import { ok, fail } from '@/lib/utils/apiResponse'

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.id;

        if (!isValid(id)) return fail('id is required');

        const updated = await updateIncome(body);
        return ok(updated);
    } catch (error) {
        console.error('Error updating income:', error);
        return fail('Failed to update income')
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!isValid(id)) return fail('Provide a valid ID');

        await deleteIncomeById(parseInt(id));
        return ok({}, 'Successfully deleted income');
    } catch (error) {
        console.error('Error deleting income:', error);
        return fail('Failed to delete income')
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
