// File: /app/api/budgets/route.ts
import {NextRequest, NextResponse} from 'next/server';
import {corsHeaders, jsonWithCors} from "@/lib/cors";
import {
    createBudget,
    getBudgetById, getBudgetByPeriodAndCategory,
    getBudgetsByCategoryId,
    getBudgetsByPeriodId
} from "@/lib/services/budgetService";

// GET /api/budgets?budgetId=... or ?categoryId=... or ?periodId=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get("userId");
    const budgetIdParam = searchParams.get('budgetId');
    const categoryIdParam = searchParams.get('categoryId');
    const periodIdParam = searchParams.get('periodId');

    try {
        if(!userIdParam){
            return jsonWithCors({ error: 'User ID is required'}, 400)
        }

        const userId = parseInt(userIdParam)
        if(isNaN(userId)){
            return jsonWithCors({ error: 'User ID is invalid'}, 400)
        }

        if (categoryIdParam && periodIdParam){
            const categoryId = parseInt(categoryIdParam)
            const periodId = parseInt(periodIdParam)

            if(isNaN(periodId) || isNaN(categoryId)){
                return jsonWithCors({ error: 'invalid input'}, 400)
            }

            const period = await getBudgetByPeriodAndCategory(userId, periodId, categoryId);
            if(!period){
                return jsonWithCors({ error: 'could not find period'}, 404)
            }

            return jsonWithCors(period)
        }
        if (categoryIdParam) {
            const categoryId = parseInt(categoryIdParam);
            if (isNaN(categoryId)) return jsonWithCors({ error: 'Invalid categoryId' }, 400);
            const budgets = await getBudgetsByCategoryId(userId, categoryId);
            if(!budgets){
                return jsonWithCors({ error: 'could not find budgets'}, 404)
            }
            return jsonWithCors(budgets);
        }
        if (periodIdParam) {
            const periodId = parseInt(periodIdParam)
            if (isNaN(periodId)) return jsonWithCors({ error: 'Invalid periodId' }, 400)
            const budgets = await getBudgetsByPeriodId(userId, periodId);
            if(!budgets){
                return jsonWithCors({ error: 'could not find budgets'}, 404)
            }
            return jsonWithCors(budgets);
        }
        if (budgetIdParam) {
            const budgetId = parseInt(budgetIdParam);
            if (isNaN(budgetId)) return jsonWithCors({ error: 'Invalid budgetId' }, 400);

            const budget = await getBudgetById(userId, budgetId);
            if(!budget){
                return jsonWithCors({ error: 'could not find budget'}, 404)
            }
            return jsonWithCors(budget ? budget : {});
        }

        return jsonWithCors({ error: 'Must provide budgetId, categoryId, or periodId' }, 400);
    } catch (error) {
        console.error('Error fetching period budgets:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/budgets
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newBudget = await createBudget(body);

        return jsonWithCors(newBudget, 201);
    } catch (error) {
        console.error('Error creating period budget:', error);
        return jsonWithCors({ error: 'Failed to create period budget' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}
