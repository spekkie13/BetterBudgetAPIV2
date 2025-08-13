import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';
import { ok, fail } from '@/lib/utils/apiResponse'
import * as categoryService from '@/lib/services/categoryService';
import {isValid} from "@/lib/helpers";

// GET /api/categories?userId=... or with &id=... or &name=...
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const teamIdParam = searchParams.get('teamId');
    if (!isValid(teamIdParam)) return fail('Team ID is required', 400);

    const teamId = parseInt(teamIdParam!);
    if (isNaN(teamId)) return fail('Team ID is invalid', 400);

    try {
        const idParam = searchParams.get('id');
        const nameParam = searchParams.get('name');

        if (isValid(idParam)) {
            const id = parseInt(idParam!);
            if (isNaN(id)) {
                console.log('Invalid category ID')
                return fail('Invalid category ID', 400);
            }

            const category = await categoryService.getCategoryByTeamAndCategoryId(id, teamId);
            return ok(category ?? {}, 'Category fetched')
        }

        if (isValid(nameParam)) {
            const category = await categoryService.getCategoryByName(nameParam, teamId);
            return ok(category ?? {}, 'Category fetched')
        }

        const allCategories = await categoryService.getAllCategories(teamId);
        return ok(allCategories, 'Categories fetched')
    } catch (error) {
        console.error('Error fetching categories:', error);
        return fail('Internal server error', 500);
    }
}

// POST /api/categories
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const newCategory = await categoryService.createCategory(body);
        return ok(newCategory, 'Category created', 201);
    } catch (error) {
        console.error('Error creating category:', error);
        return fail('Failed to create category', 400);
    }
}

// Handle OPTIONS preflight
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}
