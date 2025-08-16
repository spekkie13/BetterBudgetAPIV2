// lib/http/transactions/cursor.ts
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
