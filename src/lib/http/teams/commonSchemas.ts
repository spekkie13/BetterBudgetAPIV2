import { z } from 'zod';

// --------- Atoms ----------
export const zIdParam = z.union([z.string(), z.number()]).transform(n => Number(n))
    .refine(Number.isInteger, 'Invalid id');

export const zTeamIdParam = z.union([z.string(), z.number()]).transform(n => Number(n))
    .refine(Number.isInteger, 'Invalid teamId');

export const zCategoryIdParam = z.union([z.string(), z.number()]).transform(n => Number(n))
    .refine(Number.isInteger, 'Invalid categoryId');

export const zMonth = z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month (YYYY-MM)');
export const zMonths = z.coerce.number().int().min(1).max(36).default(6);
export const zLimit = z.coerce.number().int().min(1).max(200).default(50);

// "ISO:id" compound cursor (DESC by date then id)
export const zCursor2 = z.string().nullable().optional();

export function encodeCursor(postedAt: Date | string, id: number) {
    const iso = (postedAt instanceof Date) ? postedAt.toISOString() : new Date(postedAt).toISOString();
    return `${iso}:${id}`;
}

export function decodeCursor2(s?: string | null): { postedAt: Date; id: number } | null {
    if (!s) return null;
    const [iso, idStr] = s.split(':');
    const d = new Date(iso);
    const id = Number(idStr);
    if (Number.isNaN(d.getTime()) || !Number.isInteger(id)) return null;
    return { postedAt: d, id };
}

// --------- Date helpers (UTC) ----------
export const monthStartEndUtc = (yyyyMm: string) => {
    const start = new Date(`${yyyyMm}-01T00:00:00.000Z`);
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    return { start, end };
};

export const monthStartUtc = (d: Date) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
export const addMonthsUtc = (d: Date, n: number) =>
    new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1));
export const toYmd = (d: Date) =>
    `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
