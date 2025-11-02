import { NextRequest } from 'next/server';
import { makeCategoryController } from '@/adapters/controllers/categoryController';
import { CategoryService } from "@/adapters/services/categoryService";
import { CategoryParams } from "@/db/types/categoryTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {Team} from "@/models/team";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function POST(req: NextRequest, ctx: any) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
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
