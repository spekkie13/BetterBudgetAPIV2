import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { deleteIncomeById, updateIncome } from '@/lib/services/incomeService';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const id = body.id;

        if (!id || isNaN(id)) {
            return jsonWithCors({ error: 'Missing or invalid ID' }, 400);
        }

        const updated = await updateIncome(body);
        return jsonWithCors(updated);
    } catch (error) {
        console.error('Error updating income:', error);
        return jsonWithCors({ error: 'Failed to update income' }, 400);
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        if (!id || isNaN(id)) {
            return jsonWithCors({ error: 'Missing or invalid ID' }, 400);
        }

        await deleteIncomeById(id);
        return jsonWithCors({ message: 'Income deleted' });
    } catch (error) {
        console.error('Error deleting income:', error);
        return jsonWithCors({ error: 'Failed to delete income' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
