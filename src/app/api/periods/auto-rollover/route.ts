import { NextRequest } from 'next/server';
import { getTeamSettingsById } from '@/adapters/services/teamSettingsService'
import { runAutoRollover } from '@/adapters/services/teamSettingsService'
import { ok, fail } from "@/core/http/Response";
import { BodySchema } from "@/db/types/periodTypes";

export async function POST(req: NextRequest) {
    const json = await req.json()
    const { teamId, nowISO } = BodySchema.parse(json)

    const settings = await getTeamSettingsById(teamId)
    if (!settings)
        return fail(404, 'No settings found');

    const now = nowISO ? new Date(nowISO) : new Date()
    const result = await runAutoRollover({ now, settings, teamId })

    return result.performed ?
        ok(result) :
        fail(500, 'Internal Server Error');
}
