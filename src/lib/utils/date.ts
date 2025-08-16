// utils/date.ts
export const toYmd = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
export const yyyymmToFirstDay = (yyyyMm: string) => `${yyyyMm}-01`;

export function monthRange(yyyyMm: string) {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)); // exclusive
    return { start, end };
}
