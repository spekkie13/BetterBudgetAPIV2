import {z} from "zod";

export type Cursor = { postedAt: Date; id: number };

export function encodeCursor(c: Cursor | null): string | null {
    return c ? `${c.postedAt.toISOString()}:${c.id}` : null;
}

export function decodeCursor(s?: string | null): Cursor | null {
    if (!s) return null;
    const [iso, idStr] = s.split(':');
    const d = new Date(iso);
    const id = Number(idStr);
    if (Number.isNaN(d.getTime()) || !Number.isInteger(id)) return null;
    return { postedAt: d, id };
}

export const zCursor2 = z.string().nullable().optional();

export function encodeDateCursor(postedAt: Date | string, id: number) {
    const iso = (postedAt instanceof Date) ? postedAt.toISOString() : new Date(postedAt).toISOString();
    return `${iso}:${id}`;
}

export function decodeDateCursor2(s?: string | null): { postedAt: Date; id: number } | null {
    if (!s) return null;
    const [iso, idStr] = s.split(':');
    const d = new Date(iso);
    const id = Number(idStr);
    if (Number.isNaN(d.getTime()) || !Number.isInteger(id)) return null;
    return { postedAt: d, id };
}
