import { NextRequest } from 'next/server';
import { makeCategoryController } from '@/adapters/controllers/categoryController';
import { CategoryService } from "@/adapters/services/categoryService";
import { CategoryParams } from "@/db/types/categoryTypes";
import { ok, fail, preflightResponse, isRequestSuccessful, getUserDataByToken } from "@/core/http/ApiHelpers";
import { UserWithTeam, Team } from "@/models";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function POST(req: NextRequest, ctx: any) {
    const userWithTeam: UserWithTeam | null = await getUserDataByToken(req);
    if (!userWithTeam)
        return fail(req, 401, 'Invalid token');

    const team: Team = userWithTeam.team;
    const { id } = (ctx as { params: { id: string } }).params;

    const params = CategoryParams.safeParse({ id: id });
    if (!params.success || params.data.id === null || params.data.id === undefined)
        return fail(req, 400, 'Invalid Params');

    const result = await controller.ensureAllExists(team.id, [params.data.id]);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal Server Error');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
