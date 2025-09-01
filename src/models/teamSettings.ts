type PeriodStart = 'calendar_month' | 'anchored_month'

export interface TeamSettings {
    id: number;
    teamId: number;
    periodStart: PeriodStart;
    anchor_day: number;          // 1..31
    anchor_timezone: string;     // e.g. 'Europe/Amsterdam'
}

export type Period = {
    start: Date;   // inclusive
    end: Date;     // inclusive 23:59:59.999 in TZ, but stored as Date (UTC)
    key: string;   // canonical period key
};
