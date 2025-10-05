export const toCents = (amount: number) => Math.round(Number(amount) * 100);

export function toCentsStrict(n: number | string): number {
    const num = Number(n);
    if (!Number.isFinite(num)) throw new Error('Invalid amount');
    return Math.round(num * 100);
}

export const NEG = (cents: number) => (cents > 0 ? -cents : cents);
export const POS = (cents: number) => (cents < 0 ? -cents : cents);
