import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { TeamBody, TeamParams, TeamPatch } from "@/db/types/teamTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamParams.safeParse({ id: id });
    if (!parsed.success)
        return fail(req, 400, 'Invalid ID');

    const result = await controller.getTeamById(parsed.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function PUT(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const params = TeamParams.safeParse({ id: id });
    if (!params.success)
        return fail(req, 400, 'Invalid ID');

    const body = await req.json().catch(() => ({}));
    const bodyParsed = TeamBody.safeParse(body);
    if (!bodyParsed.success)
        return fail(req, 400, 'Missing/Invalid name');

    const updateBody: TeamPatch = {
        id: params.data.id,
        name: bodyParsed.data.name ?? "",
        createdAt: new Date(bodyParsed.data.createdAt) ?? new Date(),
    }
    const result = await controller.updateTeam(params.data.id, updateBody);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function DELETE(req: NextRequest, ctx: any) {
    const { id } = (ctx as { params: { id: string } }).params;

    const parsed = TeamParams.safeParse({ id: id });
    if (!parsed.success)
        return fail(req, 400, 'Invalid ID');

    const result = await controller.deleteTeam(parsed.data.id);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, 500, 'Internal server error...');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
