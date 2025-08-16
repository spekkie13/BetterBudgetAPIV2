// lib/services/transaction/txUtils.ts
export const NEG = (cents: number) => (cents > 0 ? -cents : cents);
export const POS = (cents: number) => (cents < 0 ? -cents : cents);

export function toCentsStrict(n: number | string): number {
    const num = Number(n);
    if (!Number.isFinite(num)) throw new Error('Invalid amount');
    return Math.round(num * 100);
}

export function toDateStrict(d: Date | string): Date {
    const dd = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dd.getTime())) throw new Error('Invalid date');
    return dd;
}
