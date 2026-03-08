import { describe, it, expect } from 'vitest';
import { parseTransactionBody, mapToInsert } from '@/core/transaction';
import { TransactionType } from '@/models/transaction';

// ─── parseTransactionBody ────────────────────────────────────────────────────

describe('parseTransactionBody', () => {
  describe('envelope unwrapping', () => {
    it('reads from body.data when present', () => {
      const body = {
        data: {
          transactionType: 'income',
          accountId: 1,
          amountCents: 10000,
          currency: 'EUR',
          postedAt: '2024-03-01T00:00:00Z',
        },
      };
      const result = parseTransactionBody(body);
      expect(result?.transactionType).toBe(TransactionType.Income);
    });

    it('reads directly from body when no data wrapper', () => {
      const body = {
        transactionType: 'income',
        accountId: 1,
        amountCents: 10000,
        currency: 'EUR',
        postedAt: '2024-03-01T00:00:00Z',
      };
      const result = parseTransactionBody(body);
      expect(result?.transactionType).toBe(TransactionType.Income);
    });
  });

  describe('validation errors', () => {
    it('throws when payload is null', () => {
      expect(() => parseTransactionBody(null)).toThrow('Invalid request body');
    });

    it('throws when payload is a primitive', () => {
      expect(() => parseTransactionBody('string')).toThrow('Invalid request body');
    });

    it('throws when transactionType is missing', () => {
      expect(() => parseTransactionBody({ accountId: 1, amountCents: 100 })).toThrow('Missing transactionType');
    });

    it('throws when type is expense and categoryId is 0', () => {
      expect(() => parseTransactionBody({
        transactionType: 'expense',
        categoryId: 0,
        accountId: 1,
        amountCents: -500,
      })).toThrow('Invalid Category ID');
    });

    it('throws when type is expense and categoryId is negative', () => {
      expect(() => parseTransactionBody({
        transactionType: 'expense',
        categoryId: -1,
        accountId: 1,
        amountCents: -500,
      })).toThrow('Invalid Category ID');
    });

    it('throws for an unsupported transactionType', () => {
      expect(() => parseTransactionBody({
        transactionType: 'refund',
        accountId: 1,
        amountCents: 100,
      })).toThrow('Unsupported transactionType: refund');
    });
  });

  describe('income', () => {
    const base = {
      transactionType: 'income',
      accountId: 2,
      amountCents: 200000,
      currency: 'USD',
      postedAt: '2024-03-01T00:00:00Z',
      memo: 'Salary',
      categoryId: null,
      createdBy: 1,
    };

    it('returns an IncomeRequestDto', () => {
      const result = parseTransactionBody(base);
      expect(result?.transactionType).toBe(TransactionType.Income);
      expect(result?.accountId).toBe(2);
      expect(result?.amountCents).toBe(200000);
      expect(result?.currency).toBe('USD');
      expect(result?.memo).toBe('Salary');
    });

    it('defaults currency to EUR when missing', () => {
      const result = parseTransactionBody({ ...base, currency: undefined });
      expect(result?.currency).toBe('EUR');
    });

    it('sets categoryId to null when null', () => {
      const result = parseTransactionBody({ ...base, categoryId: null });
      expect(result?.categoryId).toBeNull();
    });

    it('resolves accountId from fromAccountID alias', () => {
      const { accountId: _, ...rest } = base as any;
      const result = parseTransactionBody({ ...rest, fromAccountID: 99 });
      expect(result?.accountId).toBe(99);
    });
  });

  describe('expense', () => {
    const base = {
      transactionType: 'expense',
      accountId: 3,
      amountCents: -5000,
      currency: 'EUR',
      postedAt: '2024-03-01T00:00:00Z',
      categoryId: 7,
    };

    it('returns an ExpenseRequestDto', () => {
      const result = parseTransactionBody(base);
      expect(result?.transactionType).toBe(TransactionType.Expense);
      expect(result?.categoryId).toBe(7);
    });
  });

  describe('transfer', () => {
    const base = {
      transactionType: 'transfer',
      accountId: 1,
      amountCents: 10000,
      currency: 'EUR',
      postedAt: '2024-03-01T00:00:00Z',
      fromAccountId: 1,
      toAccountId: 2,
    };

    it('returns a TransferRequestDto with fromAccountId and toAccountId', () => {
      const result = parseTransactionBody(base) as any;
      expect(result?.transactionType).toBe(TransactionType.Transfer);
      expect(result?.fromAccountId).toBe(1);
      expect(result?.toAccountId).toBe(2);
    });

    it('resolves account ids from uppercase aliases', () => {
      const result = parseTransactionBody({
        transactionType: 'transfer',
        amountCents: 10000,
        currency: 'EUR',
        postedAt: '2024-03-01T00:00:00Z',
        fromAccountID: 5,
        toAccountID: 6,
      }) as any;
      expect(result?.fromAccountId).toBe(5);
      expect(result?.toAccountId).toBe(6);
    });
  });
});

// ─── mapToInsert ─────────────────────────────────────────────────────────────

describe('mapToInsert', () => {
  const baseDto = {
    transactionType: TransactionType.Income,
    accountId: 2,
    amountCents: 200000,
    currency: 'EUR',
    postedAt: '2024-03-01T00:00:00Z',
    memo: 'Salary',
    categoryId: null,
    createdBy: 1,
  } as const;

  it('maps basic fields correctly', () => {
    const result = mapToInsert(10, baseDto);
    expect(result.teamId).toBe(10);
    expect(result.accountId).toBe(2);
    expect(result.amountCents).toBe(200000);
    expect(result.currency).toBe('EUR');
    expect(result.postedAt).toBeInstanceOf(Date);
    expect(result.memo).toBe('Salary');
    expect(result.categoryId).toBeNull();
    expect(result.createdBy).toBe(1);
  });

  it('sets isTransfer to false for income', () => {
    const result = mapToInsert(10, baseDto);
    expect(result.isTransfer).toBe(false);
  });

  it('sets isTransfer to true for transfer', () => {
    const dto: any = {
      ...baseDto,
      transactionType: TransactionType.Transfer,
      fromAccountId: 1,
      toAccountId: 3,
    };
    const result = mapToInsert(10, dto);
    expect(result.isTransfer).toBe(true);
    expect(result.fromAccountId).toBe(1);
    expect(result.toAccountId).toBe(3);
  });

  it('sets fromAccountId/toAccountId to null for non-transfer', () => {
    const result = mapToInsert(10, baseDto);
    expect(result.fromAccountId).toBeNull();
    expect(result.toAccountId).toBeNull();
  });

  it('defaults memo to null when undefined', () => {
    const { memo: _, ...dto } = baseDto as any;
    const result = mapToInsert(10, dto);
    expect(result.memo).toBeNull();
  });

  it('converts postedAt string to a Date object', () => {
    const result = mapToInsert(10, baseDto);
    expect(result.postedAt).toEqual(new Date('2024-03-01T00:00:00Z'));
  });
});
