import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { TeamBody, TeamQuery } from "@/db/types/teamTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, isRequestSuccessful } from "@/core/http/Response";
import {preflightResponse} from "@/core/http/cors";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = TeamQuery.safeParse({ teamId: sp.get('teamId') ?? undefined });
    if (!parsed.success)
        return fail(400, 'Invalid Team ID');

    let result;
    if (parsed.data.id !== undefined)
        result = await controller.getTeamById(parsed.data.id);
    else
        result = await controller.selectAll();

    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal server error...');
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = TeamBody.safeParse(body);
    if (!parsed.success)
        return fail(400, 'Missing Team name');

    const result = await controller.createTeam(parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(result.data) :
        fail(500, 'Internal server error...');
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
