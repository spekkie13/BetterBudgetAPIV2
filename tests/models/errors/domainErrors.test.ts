import { describe, it, expect } from 'vitest';

// Budget errors
import { BudgetNotFoundError } from '@/models/errors/budget/NotFound';
import { BudgetNotFoundForTeamError } from '@/models/errors/budget/NotFoundForTeam';
import { BudgetAlreadyExistsError } from '@/models/errors/budget/AlreadyExists';
import { BudgetAccessDeniedError } from '@/models/errors/budget/AccessDenied';
import { CategoryNotFoundForBudgetError } from '@/models/errors/budget/CategoryNotFoundForBudget';

// Category errors
import { CategoryNotFoundError } from '@/models/errors/category/NotFound';
import { CategoryAccessDeniedError } from '@/models/errors/category/AccessDenied';
import { CategoryAlreadyExistsError } from '@/models/errors/category/DuplicateCategory';
import { CategoryInUseError } from '@/models/errors/category/CategoryInUse';
import { InvalidCategoryDataError } from '@/models/errors/category/InvalidCategory';

// Team errors
import { TeamNotFoundError } from '@/models/errors/team/NotFound';
import { TeamAccessDeniedError } from '@/models/errors/team/AccessDenied';
import { UserNotInTeamError } from '@/models/errors/team/UserNotInTeam';

// Transaction errors
import { TransactionNotFoundError } from '@/models/errors/transaction/NotFound';
import { TransactionAccessDeniedError } from '@/models/errors/transaction/AccessDenied';
import { InvalidTransactionAmountError } from '@/models/errors/transaction/InvalidAmount';
import { FutureDateNotAllowedError } from '@/models/errors/transaction/FutureDateNotAllowed';
import { InvalidTransactionTypeError } from '@/models/errors/transaction/InvalidTransactionType';
import { AccountNotFoundForTransactionError } from '@/models/errors/transaction/AccountNotFoundForTransaction';

// User errors
import { UserNotFoundError } from '@/models/errors/user/NotFound';
import { UserAlreadyExistsError } from '@/models/errors/user/DuplicateUser';
import { InvalidCredentialsError } from '@/models/errors/user/InvalidCredentials';
import { InvalidTokenError } from '@/models/errors/user/InvalidToken';

// ─── Budget errors ───────────────────────────────────────────────────────────

describe('BudgetNotFoundError', () => {
  it('has statusCode 404 and includes id in message', () => {
    const err = new BudgetNotFoundError(42);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('42');
    expect(err.message).toContain('Budget');
  });
});

describe('BudgetNotFoundForTeamError', () => {
  it('has statusCode 404 and includes teamId in message', () => {
    const err = new BudgetNotFoundForTeamError(10);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('10');
    expect(err.message).toContain('Budget');
  });
});

describe('BudgetAlreadyExistsError', () => {
  it('has statusCode 409 and includes categoryId and period in message', () => {
    const err = new BudgetAlreadyExistsError(5, '2024-03');
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('5');
    expect(err.message).toContain('2024-03');
  });
});

describe('BudgetAccessDeniedError', () => {
  it('has statusCode 403 and includes budgetId in message', () => {
    const err = new BudgetAccessDeniedError(7);
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('7');
  });
});

describe('CategoryNotFoundForBudgetError', () => {
  it('has statusCode 404 and includes categoryId in message', () => {
    const err = new CategoryNotFoundForBudgetError(3);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('3');
  });
});

// ─── Category errors ─────────────────────────────────────────────────────────

describe('CategoryNotFoundError', () => {
  it('has statusCode 404 and includes id in message', () => {
    const err = new CategoryNotFoundError(8);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('8');
  });
});

describe('CategoryAccessDeniedError', () => {
  it('has statusCode 403 and includes categoryId in message', () => {
    const err = new CategoryAccessDeniedError(9);
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('9');
  });
});

describe('CategoryAlreadyExistsError', () => {
  it('has statusCode 409 and includes category name in message', () => {
    const err = new CategoryAlreadyExistsError('Groceries');
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('Groceries');
  });
});

describe('CategoryInUseError', () => {
  it('mentions budgets when reason is budgets', () => {
    const err = new CategoryInUseError(1, 'budgets');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('budgets');
    expect(err.message).toContain('1');
  });

  it('mentions transactions when reason is transactions', () => {
    const err = new CategoryInUseError(2, 'transactions');
    expect(err.message).toContain('transactions');
  });

  it('mentions both when reason is both', () => {
    const err = new CategoryInUseError(3, 'both');
    expect(err.message).toContain('budgets and transactions');
  });
});

describe('InvalidCategoryDataError', () => {
  it('has statusCode 400 and includes field and issue in message', () => {
    const err = new InvalidCategoryDataError('color', 'must be a hex code');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('color');
    expect(err.message).toContain('must be a hex code');
    expect(err.field).toBe('color');
  });
});

// ─── Team errors ─────────────────────────────────────────────────────────────

describe('TeamNotFoundError', () => {
  it('has statusCode 404 and includes id in message', () => {
    const err = new TeamNotFoundError(5);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('5');
    expect(err.message).toContain('Team');
  });

  it('omits id from message when not provided', () => {
    const err = new TeamNotFoundError();
    expect(err.message).toBe('Team not found');
  });
});

describe('TeamAccessDeniedError', () => {
  it('has statusCode 403 and includes teamId in message', () => {
    const err = new TeamAccessDeniedError(11);
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('11');
  });
});

describe('UserNotInTeamError', () => {
  it('has statusCode 403 and includes both userId and teamId', () => {
    const err = new UserNotInTeamError(1, 2);
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('1');
    expect(err.message).toContain('2');
  });
});

// ─── Transaction errors ───────────────────────────────────────────────────────

describe('TransactionNotFoundError', () => {
  it('has statusCode 404 and includes id in message', () => {
    const err = new TransactionNotFoundError(99);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('99');
    expect(err.message).toContain('Transaction');
  });
});

describe('TransactionAccessDeniedError', () => {
  it('has statusCode 403 and includes transactionId in message', () => {
    const err = new TransactionAccessDeniedError(55);
    expect(err.statusCode).toBe(403);
    expect(err.message).toContain('55');
  });
});

describe('InvalidTransactionAmountError', () => {
  it('has statusCode 400 and includes amount and type in message', () => {
    const err = new InvalidTransactionAmountError(-100, 'income');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('-100');
    expect(err.message).toContain('income');
    expect(err.field).toBe('amountCents');
  });
});

describe('FutureDateNotAllowedError', () => {
  it('has statusCode 400 and includes the date in message', () => {
    const err = new FutureDateNotAllowedError('2099-01-01');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('2099-01-01');
    expect(err.field).toBe('postedAt');
  });
});

describe('InvalidTransactionTypeError', () => {
  it('has statusCode 400 and includes the invalid type in message', () => {
    const err = new InvalidTransactionTypeError('refund');
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain('refund');
    expect(err.field).toBe('transactionType');
  });
});

describe('AccountNotFoundForTransactionError', () => {
  it('has statusCode 404 and includes accountId in message', () => {
    const err = new AccountNotFoundForTransactionError(7);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('7');
  });
});

// ─── User errors ─────────────────────────────────────────────────────────────

describe('UserNotFoundError', () => {
  it('has statusCode 404 and includes id in message', () => {
    const err = new UserNotFoundError(3);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('3');
    expect(err.message).toContain('User');
  });

  it('omits id when not provided', () => {
    const err = new UserNotFoundError();
    expect(err.message).toBe('User not found');
  });
});

describe('UserAlreadyExistsError', () => {
  it('has statusCode 409 and includes email in message', () => {
    const err = new UserAlreadyExistsError('test@example.com');
    expect(err.statusCode).toBe(409);
    expect(err.message).toContain('test@example.com');
  });
});

describe('InvalidCredentialsError', () => {
  it('has statusCode 401 with a fixed message', () => {
    const err = new InvalidCredentialsError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Invalid email or password');
  });
});

describe('InvalidTokenError', () => {
  it('has statusCode 401 with a fixed message', () => {
    const err = new InvalidTokenError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Invalid or expired token');
  });
});
