// utils/date.ts
import {TeamSettings} from "@/models/teamSettings";
import {Period} from "@/models/period";

export const toYmd = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
export const yyyymmToFirstDay = (yyyyMm: string) => `${yyyyMm}-01`;

export function monthRange(yyyyMm: string) {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)); // exclusive
    return { start, end };
}

function getYMDInTZ(d: Date, tz: string) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    // "YYYY-MM-DD"
    const [y, m, day] = fmt.format(d).split('-').map(Number);
    return { y, m, d: day };
}

function makeDateInTZ(y: number, m: number, d: number, tz: string, h=0, min=0, s=0, ms=0) {
    const pad = (n: number, w=2) => String(n).padStart(w, '0');
    const isoLocal = `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}.${pad(ms)}`;

    const dtf = new Intl.DateTimeFormat('en-CA', { timeZone: tz, hour12: false,
        year:'numeric', month:'2-digit', day:'2-digit',
        hour:'2-digit', minute:'2-digit', second:'2-digit' });
    const parts = dtf.formatToParts(new Date(isoLocal));

    const val = Object.fromEntries(parts.map(p => [p.type, p.value]));
    const asIso = `${val.year}-${val.month}-${val.day}T${val.hour}:${val.minute}:${val.second}.${pad(ms,3)}Z`;

    return new Date(asIso);
}

function daysInMonth(y: number, m: number) {
    return new Date(Date.UTC(y, m, 0)).getUTCDate(); // m=1..12 → ok
}

function clampDay(y: number, m: number, anchorDay: number) {
    return Math.min(anchorDay, daysInMonth(y, m));
}

function periodKeyCalendar(y: number, m: number) {
    return `${y}-${String(m).padStart(2,'0')}`;
}
function periodKeyAnchored(startY: number, startM: number, anchorDay: number) {
    return `${startY}-${String(startM).padStart(2,'0')}@A=${String(anchorDay).padStart(2,'0')}`;
}

function resolveAnchoredPeriodContaining(date: Date, settings: TeamSettings): Period {
    const tz = settings.anchor_timezone;
    const anchor = settings.anchor_day;

    const { y, m, d } = getYMDInTZ(date, tz);
    const startDayThisMonth = clampDay(y, m, anchor);

    let startY = y, startM = m;
    if (d < startDayThisMonth) {
        const prev = new Date(Date.UTC(y, m-2, 15));
        const { y:py, m:pm } = getYMDInTZ(prev, tz);
        startY = py;
        startM = pm;
    }
    const actualStartDay = clampDay(startY, startM, anchor);
    const start = makeDateInTZ(startY, startM, actualStartDay, tz, 0,0,0,0);

    let nextY = startY, nextM = startM + 1;
    if (nextM === 13) { nextM = 1; nextY++; }
    const nextStartDay = clampDay(nextY, nextM, anchor);
    const nextStart = makeDateInTZ(nextY, nextM, nextStartDay, tz, 0,0,0,0);

    const end = new Date(nextStart.getTime() - 1);
    const key = periodKeyAnchored(startY, startM, anchor);

    return { start, end, key };
}

function resolveCalendarMonthContaining(date: Date, tz: string): Period {
    const { y, m } = getYMDInTZ(date, tz);
    const start = makeDateInTZ(y, m, 1, tz, 0,0,0,0);
    const end = makeDateInTZ(y, m, daysInMonth(y, m), tz, 23,59,59,999);
    const key = periodKeyCalendar(y, m);
    return { start, end, key };
}

export function resolveCurrentPeriod(now: Date, teamSettings: TeamSettings): Period {
    if (teamSettings.periodStart === 'anchored_month') {
        return resolveAnchoredPeriodContaining(now, teamSettings);
    }
    return resolveCalendarMonthContaining(now, teamSettings.anchor_timezone);
}

export function resolvePrevPeriod(from: Date, teamSettings: TeamSettings): Period {
    const cur = resolveCurrentPeriod(from, teamSettings);
    const prevAnchor = new Date(cur.start.getTime() - 1);
    if (teamSettings.periodStart === 'anchored_month') {
        return resolveAnchoredPeriodContaining(prevAnchor, teamSettings);
    }
    return resolveCalendarMonthContaining(prevAnchor, teamSettings.anchor_timezone);
}

export function resolveNextPeriod(from: Date, teamSettings: TeamSettings): Period {
    const cur = resolveCurrentPeriod(from, teamSettings);
    const nextAnchor = new Date(cur.end.getTime() + 1);
    if (teamSettings.periodStart === 'anchored_month') {
        return resolveAnchoredPeriodContaining(nextAnchor, teamSettings);
    }
    return resolveCalendarMonthContaining(nextAnchor, teamSettings.anchor_timezone);
}
