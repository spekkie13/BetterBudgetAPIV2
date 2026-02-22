/** Accepts "YYYY-MM" or Date and returns canonical "YYYY-MM-01" (UTC) */
export function monthToDate(input: string | Date): string {
    if (typeof input === 'string') return `${input}-01`;
    const y = input.getUTCFullYear();
    const m = String(input.getUTCMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
}
