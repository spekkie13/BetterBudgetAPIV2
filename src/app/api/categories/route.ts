import { NextRequest } from 'next/server';
import { CategoryService } from "@/adapters/services/categoryService";
import { makeCategoryController } from "@/adapters/controllers/categoryController";
import { CategoryBody, CategoryInsert, CategoryParams, CategoryQuery } from "@/db/types/categoryTypes";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";
import {UserWithTeam} from "@/models/userWithTeams";
import {getUserByToken} from "@/core/http/requestHelpers";
import {Team} from "@/models/team";

const svc = new CategoryService();
const controller = makeCategoryController(svc);

export async function GET(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const searchParams = new URL(req.url).searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    const parsedQuery = CategoryQuery.safeParse({
        teamId: team.id,
        id: id,
        type: type
    });

    if (!parsedQuery.success)
        return fail(req, 400, 'Invalid Params')

    const result = await controller.getCategory(parsedQuery.data.teamId, parsedQuery.data.id)
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const sp = new URL(req.url).searchParams;
    const id = sp.get("id");

    const params = CategoryParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid Params')

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid Body')

    const categoryBody: CategoryInsert = {
        id: params.data.id,
        teamId: team.id,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };

    const result = await controller.updateCategory(team.id, params.data.id ?? 0, categoryBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const reqBody = await req.json().catch(() => ({}));
    const parsedBody = CategoryBody.safeParse(reqBody);
    if (!parsedBody.success)
        return fail(req, 400, 'Invalid body')

    const categoryBody: CategoryInsert = {
        teamId: team.id,
        name: parsedBody.data.name ?? "",
        color: parsedBody.data.color ?? "",
        type: parsedBody.data.type as 'income' | 'expense' | 'transfer',
        icon: parsedBody.data.icon ?? "",
        parentId: parsedBody.data.parentId ?? 0,
    };

    const result = await controller.createCategory(team.id, categoryBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const token = req.headers.get('authorization')?.split('Bearer ')[1];
    if (!token)
        return fail(req, 401, 'Invalid token');

    const userWithTeam: UserWithTeam = await getUserByToken(token);
    const team: Team = userWithTeam.team;

    const { id } = (ctx as { params: { id: string } }).params;
    const params = CategoryParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid params');
    if (params.data.id === undefined)
        return fail(req, 400, 'Invalid Id');

    const result = await controller.deleteCategory(team.id, params.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
