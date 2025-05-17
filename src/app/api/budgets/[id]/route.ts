import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import { updateBudget, deleteBudgetById } from '@/lib/services/budgetService';

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const updated = await updateBudget(body);
        return jsonWithCors(updated);
    } catch (error) {
        console.error('Error updating budget:', error);
        return jsonWithCors({ error: 'Failed to update budget' }, 400);
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');

    if (!idParam) return jsonWithCors({ error: 'ID is required' }, 400);

    const id = parseInt(idParam);
    if (isNaN(id)) return jsonWithCors({ error: 'Invalid ID' }, 400);

    try {
        await deleteBudgetById(id);
        return jsonWithCors({ message: 'Budget deleted' });
    } catch (error) {
        console.error('Error deleting budget:', error);
        return jsonWithCors({ error: 'Failed to delete budget' }, 400);
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
