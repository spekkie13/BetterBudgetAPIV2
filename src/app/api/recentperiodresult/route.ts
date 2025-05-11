import { NextResponse, NextRequest } from 'next/server'
import {
    buildPeriodFilters,
    createNewPeriodResult,
    deletePeriodResults, findPeriodResultsByFilter,
    updatePeriodResult
} from "@/lib/services/recentperiodresultService";
import {corsHeaders, jsonWithCors} from "@/lib/cors";

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    })
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const UserIdParam = searchParams.get('userId');
    const CategoryIdParam = searchParams.get('categoryId');
    const MonthAndYearParam = searchParams.get('monthAndYear');

    const UserId = UserIdParam ? Number.parseInt(UserIdParam) : 0;
    const CategoryId = CategoryIdParam ? Number.parseInt(CategoryIdParam) : 0;

    if ((UserId && isNaN(UserId)) || (CategoryId && isNaN(CategoryId))) {
        return jsonWithCors({ error: 'invalid input' }, 400);
    }

    let from: Date | undefined;
    let to: Date | undefined;

    if (MonthAndYearParam) {
        try {
            const decoded = decodeURIComponent(MonthAndYearParam);
            const [monthStr, yearStr] = decoded.split('-');

            const month = parseInt(monthStr);
            const year = parseInt(yearStr);

            if (
                isNaN(month) || isNaN(year) ||
                month < 1 || month > 12 || year < 1000 || year > 9999
            ) {
                return jsonWithCors({ error: 'invalid monthAndYear format' }, 400);
            }

            from = new Date(Date.UTC(year, month - 1, 1));
            to = new Date(Date.UTC(year, month, 1));
        } catch {
            return jsonWithCors({ error: 'invalid monthAndYear format' }, 400);
        }
    }

    try {
        const where = await buildPeriodFilters(UserId, CategoryId, from, to);
        const categories = await findPeriodResultsByFilter(where);
        return jsonWithCors(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        return jsonWithCors({ error: 'Internal server error' }, 500);
    }
}

export async function POST (req: NextRequest) {
    const recentperiodresult = await req.json()

    try{
        const created = await createNewPeriodResult(recentperiodresult)
        return jsonWithCors(created.id)
    }catch(err){
        console.log('create error:', err)
        return jsonWithCors({error: 'Failed to insert category'}, 500)
    }
}

export async function DELETE (req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const RecentPeriodResultId = Number.parseInt(searchParams.get('recentperiodresultid') || '');

    if(isNaN(RecentPeriodResultId)){
        return jsonWithCors({error: 'invalid IDs'}, 400)
    }

    const result = await deletePeriodResults(RecentPeriodResultId)

    return jsonWithCors(result.count > 0)
}

export async function PATCH (req: NextRequest) {
    const data = await req.json()
    if (!data.id) {
        return jsonWithCors({ error: 'Missing recent period result ID'}, 400)
    }

    const updated = await updatePeriodResult(data)
    return jsonWithCors(!!updated)
}
