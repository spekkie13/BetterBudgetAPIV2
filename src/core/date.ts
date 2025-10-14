export function currentMonthStr(): string {
    const d = new Date();
    return yyyymm01(d.getUTCFullYear(), d.getUTCMonth() + 1);
}

export function yyyymm01(year: number, month1: number): string {
    const m = String(month1).padStart(2, '0');
    return `${year}-${m}-01`;
}

export function addMonthsStr(monthStr: string, n: number): string {
    const [y, m] = monthStr.split('-').map(Number);
    const base = new Date(Date.UTC(y, m - 1, 1));
    base.setUTCMonth(base.getUTCMonth() + n);
    return yyyymm01(base.getUTCFullYear(), base.getUTCMonth() + 1);
}

export function generateMonthKeys(startMonthStr: string, horizon: number): string[] {
    const out: string[] = [];
    for(let i = 0; i < horizon; i++) {
        out.push(addMonthsStr(startMonthStr, i));
    }
    return out;
}

export function monthLE(a: string, b: string): boolean {
    return a <= b;
}

export const pad = (n:number)=>String(n).padStart(2,'0')
export const toMonthStartString = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-01`
export const firstOfMonthUTC = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1))
export const addMonthsUTC = (d: Date, n: number) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth()+n, 1))

export const toYmd = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"

/** Accepts "YYYY-MM" or Date and returns canonical "YYYY-MM-01" (UTC) */
export function monthToDate(input: string | Date): string {
    if (typeof input === 'string') return `${input}-01`;
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}

export const monthStartEndUtc = (yyyyMm: string) => {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return { start, end };
};
