// File: /app/api/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders, jsonWithCors } from '@/lib/cors';
import * as categoryService from '@/lib/services/categoryService';

// GET /api/categories or ?id=... or ?name=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userIdParam = searchParams.get('userId');
    const idParam = searchParams.get('id');
    const nameParam = searchParams.get('name');

    try {
        if(!userIdParam) {
            return jsonWithCors({error: 'User ID is required'});
        }
        if(userIdParam) {
            const userId = parseInt(userIdParam);
            if(isNaN(userId)) {
                return jsonWithCors({error: 'User ID is invalid'});
            }
            if (idParam) {
                const id = parseInt(idParam);
                if (isNaN(id)) return jsonWithCors({ error: 'Invalid id' }, 400);

                const category = await categoryService.getCategoryById(id, userId);
                return jsonWithCors(category ? category : {});
            }

            if (nameParam) {
                const category = await categoryService.getCategoryByName(nameParam, userId);
                return jsonWithCors(category ? category : {});
            }

            const allCategories = await categoryService.getAllCategories(userId);
            return jsonWithCors(allCategories);
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

// POST /api/categories
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newCategory = await categoryService.createCategory({
            name: body.name,
            color: body.color,
            icon: body.icon,
            userId: body.userId,
        });

        return jsonWithCors(newCategory, 201);
    } catch (error) {
        console.error('Error creating category:', error);
        return jsonWithCors({ error: 'Failed to create category' }, 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
