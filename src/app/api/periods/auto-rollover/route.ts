import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTeamSettingsById } from '@/adapters/services/teamSettingsService'
import { runAutoRollover } from '@/adapters/services/teamSettingsService'
import {zDateTime, zTeamId} from "@/db/types/common";

const BodySchema = z.object({
    teamId: zTeamId,
    nowISO: zDateTime,
})

export async function POST(req: NextRequest) {
    try{
        const json = req.json()
        const { teamId, nowISO } = BodySchema.parse(json)

        const settings = await getTeamSettingsById(teamId)
        if (!settings) {
            return NextResponse.json({
                error: 'No settings found',
                status: 404
            })
        }

        const now = nowISO ? new Date(nowISO) : new Date()
        const result = await runAutoRollover({ now, settings, teamId })
        return NextResponse.json({
            status: 200,
            result: result
        })
    }catch(err: any){
        console.error('auto-rollover error', err)
        if (err?.name === 'ZodError') {
            return NextResponse.json({ error: 'BAD_REQUEST', details: err.errors }, { status: 400 })
        }
        return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
    }
}
