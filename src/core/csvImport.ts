import { createHash } from 'crypto';
import { TransactionCreateInput } from '@/core/transaction';

export interface CsvImportRow {
    date: string;
    amountCents: string;
    currency: string;
    type: string;
    accountId: string;
    payee?: string;
    memo?: string;
    categoryId?: string;
}

export interface ParsedCsvRow {
    input: TransactionCreateInput;
    importHash: string;
}

export interface CsvRowError {
    row: number;
    error: string;
}

const REQUIRED_COLUMNS = ['date', 'amountcents', 'currency', 'type', 'accountid'] as const;

function parseCsvText(text: string): { headers: string[]; rows: string[][] } {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim()));
    return { headers, rows };
}

export function computeImportHash(
    teamId: number,
    accountId: number,
    amountCents: number,
    currency: string,
    postedAt: Date,
    payee: string | null | undefined,
    memo: string | null | undefined,
): string {
    const canonical = [
        teamId,
        accountId,
        amountCents,
        currency.toUpperCase(),
        postedAt.toISOString(),
        (payee ?? '').trim().toLowerCase(),
        (memo ?? '').trim().toLowerCase(),
    ].join('|');

    return createHash('sha256').update(canonical).digest('hex');
}

export function parseCsvImport(
    csvText: string,
    teamId: number,
): { valid: ParsedCsvRow[]; errors: CsvRowError[] } {
    const { headers, rows } = parseCsvText(csvText);
    const errors: CsvRowError[] = [];

    const missingRequired = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    if (missingRequired.length > 0) {
        return {
            valid: [],
            errors: [{ row: 0, error: `Missing required columns: ${missingRequired.join(', ')}` }],
        };
    }

    const idx = (col: string) => headers.indexOf(col.toLowerCase());

    const valid: ParsedCsvRow[] = [];

    rows.forEach((cells, i) => {
        const rowNum = i + 2; // 1-based, accounting for header row
        const get = (col: string) => cells[idx(col)] ?? '';

        const dateStr = get('date');
        const amountStr = get('amountcents');
        const currency = get('currency').toUpperCase();
        const type = get('type').toLowerCase();
        const accountIdStr = get('accountid');
        const payee = get('payee') || null;
        const memo = get('memo') || null;
        const categoryIdStr = get('categoryid');

        if (!dateStr || !amountStr || !currency || !type || !accountIdStr) {
            errors.push({ row: rowNum, error: 'Missing required field value' });
            return;
        }

        const postedAt = new Date(dateStr);
        if (isNaN(postedAt.getTime())) {
            errors.push({ row: rowNum, error: `Invalid date: ${dateStr}` });
            return;
        }

        const amountCents = parseInt(amountStr, 10);
        if (isNaN(amountCents)) {
            errors.push({ row: rowNum, error: `Invalid amountCents: ${amountStr}` });
            return;
        }

        const accountId = parseInt(accountIdStr, 10);
        if (isNaN(accountId) || accountId <= 0) {
            errors.push({ row: rowNum, error: `Invalid accountId: ${accountIdStr}` });
            return;
        }

        if (!['income', 'expense', 'transfer'].includes(type)) {
            errors.push({ row: rowNum, error: `Invalid type: ${type}` });
            return;
        }

        const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : null;
        if (categoryIdStr && isNaN(categoryId!)) {
            errors.push({ row: rowNum, error: `Invalid categoryId: ${categoryIdStr}` });
            return;
        }

        const importHash = computeImportHash(teamId, accountId, amountCents, currency, postedAt, payee, memo);

        valid.push({
            importHash,
            input: {
                teamId,
                accountId,
                amountCents,
                currency,
                postedAt,
                payee,
                memo,
                categoryId,
                transactionType: type,
                isTransfer: type === 'transfer',
                importHash,
            },
        });
    });

    return { valid, errors };
}