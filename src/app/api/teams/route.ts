import { NextRequest } from 'next/server';
import { makeTeamsController } from '@/adapters/controllers/teamsController';
import { TeamBody, TeamQuery } from "@/db/types/teamTypes";
import { TeamService } from "@/adapters/services/teamService";
import { ok, fail, preflightResponse, isRequestSuccessful } from "@/core/http/ApiHelpers";

const svc = new TeamService();
const controller = makeTeamsController(svc);

export async function GET(req: NextRequest) {
    const sp = new URL(req.url).searchParams;
    const parsed = TeamQuery.safeParse({ teamId: sp.get('teamId') ?? undefined });
    if (!parsed.success)
        return fail(req, 400, 'Invalid Team ID');

    let result;
    if (parsed.data.id !== undefined)
        result = await controller.getTeamById(parsed.data.id);
    else
        result = await controller.selectAll();

    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const parsed = TeamBody.safeParse(body);
    if (!parsed.success)
        return fail(req, 400, 'Missing Team name');

    const result = await controller.createTeam(parsed.data);
    return isRequestSuccessful(result.status) ?
        ok(req, result.data) :
        fail(req, result.status, result.error);
}

export async function OPTIONS(req: NextRequest) {
    return preflightResponse(req);
}
