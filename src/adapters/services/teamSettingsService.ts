import { eq, and } from 'drizzle-orm'
import { resolveCurrentPeriod, resolveNextPeriod } from "@/core/date";
import {closing_runs, periods, team_settings} from '@/db/schema';
import { TeamSettings } from "@/core/teamSettings";
import {db} from "@/db/client";

type PeriodSummary = { start: Date; end: Date; key: string; };

type RunArgs = {
    teamId: number,
    now: Date,
    settings: TeamSettings
}

type RolloverResult = {
    performed: boolean,
    idempotent: boolean,
    periodsProcessed: Array<{ from: string; to: string; categories: number; poolDeltaMinor: number; }>
    warnings: string[]
}

export async function runAutoRollover({ teamId, now, settings } : RunArgs) : Promise<RolloverResult> {
    const warnings: string[] = []

    const pNow = resolveCurrentPeriod(now, settings);

    const latest = await db.query.periods.findFirst({
        where: eq(periods.teamId, teamId),
        orderBy: (p: any, { desc }: any) => [desc(p.startDate)]
    })

    if (!latest) {
        await ensurePeriodExists(db, teamId, pNow)
        return { performed: false, idempotent: true, periodsProcessed: [], warnings }
    }

    if (latest.key === pNow.key) {
        return { performed: false, idempotent: true, periodsProcessed: [], warnings }
    }

    let cursor = { start: new Date(latest.startDate), end: new Date(latest.endDate), key: latest.key } as PeriodSummary
    const processed: RolloverResult['periodsProcessed'] = []

    while (latest.key !== pNow.key) {
        const next = resolveNextPeriod(cursor.end, settings)
        // Idempotency per stap met closing_runs.dedupe_key = teamId:cursor.key
        const { categoriesProcessed, poolDeltaMinor, dedupHit, stepWarnings } =
            await closeAndOpenPeriod({ db, teamId, from: cursor, to: next, settings })

        if (stepWarnings?.length) warnings.push(...stepWarnings)

        processed.push({
            from: cursor.key,
            to: next.key,
            categories: categoriesProcessed,
            poolDeltaMinor: poolDeltaMinor,
        })

        cursor = next
    }


    const idempotent = processed.length === 0
    const performed = processed.length > 0
    return { performed, idempotent, periodsProcessed: processed, warnings }
}

async function ensurePeriodExists(db: any, teamId: number, p: PeriodSummary) {
    // Pas veldnamen aan jouw schema aan
    await db.insert(periods).values({
        teamId,
        year: p.start.getUTCFullYear(),
        month: p.start.getUTCMonth() + 1,
        startDate: p.start,
        endDate: p.end,
        status: 'open',
        key: p.key, // voeg dit veld toe in schema als je 'm nog niet had; anders herleid key uit (year,month)
    }).onConflictDoNothing()
}

async function closeAndOpenPeriod(args: {
    db: any
    teamId: number
    from: PeriodSummary
    to: PeriodSummary
    settings: TeamSettings
}): Promise<{ categoriesProcessed: number; poolDeltaMinor: number; dedupHit: boolean; stepWarnings: string[] }> {
    const { db, teamId, from, to } = args
    const dedupeKey = `${teamId}:${from.key}`
    const stepWarnings: string[] = []
    let dedupHit = false

    return await db.transaction(async (tx: any) => {
        // 1) Idempotency guard
        const existing = await tx.query.closing_runs.findFirst({
            where: eq(closing_runs.dedupeKey, dedupeKey),
        })
        if (existing?.status === 'succeeded') {
            dedupHit = true
            return { categoriesProcessed: 0, poolDeltaMinor: 0, dedupHit, stepWarnings }
        }

        // 2) Create or mark run
        const run = existing ?? (await tx.insert(closing_runs).values({
            teamId,
            fromPeriodKey: from.key,  // voeg deze twee kolommen toe of gebruik ids
            toPeriodKey: to.key,
            status: 'started',
            dedupeKey,
        }).returning())[0]

        // 3) Ensure periods exist with expected boundaries
        await ensurePeriodExists(tx, teamId, from)
        await ensurePeriodExists(tx, teamId, to)

        // 4) ---- Rekenlogica carryover (VUL JE STRATEGIE IN HIER) ----
        //    - Aggregate spent per category in 'from'
        //    - Compute available & carryOut per policy
        //    - Sum poolDelta
        //    - Upsert budget_entries for 'to', set carryIn
        //    - Apply poolDelta on pool category in 'to'
        //
        //    Voor nu doen we een no-op zodat je endpoint alvast werkt.
        const categoriesProcessed = 0
        const poolDeltaMinor = 0

        // 5) Mark statuses
        await tx.update(periods).set({ status: 'closed' }).where(and(
            eq(periods.teamId, teamId),
            eq(periods.key, from.key)
        ))

        await tx.update(closing_runs).set({ status: 'succeeded' }).where(eq(closing_runs.id, run.id))

        return { categoriesProcessed, poolDeltaMinor, dedupHit, stepWarnings }
    })
}

export async function getTeamSettingsById(teamId: number) : Promise<TeamSettings> {
    const [row] = await db
        .select()
        .from(team_settings)
        .where(eq(team_settings.teamId, teamId))

    return row
}
