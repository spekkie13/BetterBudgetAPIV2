// utils/date.ts
export const toYmd = (d: Date) => d.toISOString().slice(0, 10); // "YYYY-MM-DD"
export const yyyymmToFirstDay = (yyyyMm: string) => `${yyyyMm}-01`;
