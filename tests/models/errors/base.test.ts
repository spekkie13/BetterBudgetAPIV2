import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  NotFoundForTeamError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  ZodValidationError,
} from '@/models/errors/base';

describe('AppError', () => {
  it('sets message and default statusCode 500', () => {
    const err = new AppError('something failed');
    expect(err.message).toBe('something failed');
    expect(err.statusCode).toBe(500);
    expect(err instanceof Error).toBe(true);
  });

  it('accepts a custom statusCode', () => {
    const err = new AppError('not found', 404);
    expect(err.statusCode).toBe(404);
  });

  it('sets name to the constructor class name', () => {
    const err = new AppError('msg');
    expect(err.name).toBe('AppError');
  });
});

describe('ValidationError', () => {
  it('has statusCode 400', () => {
    const err = new ValidationError('invalid field');
    expect(err.statusCode).toBe(400);
  });

  it('stores the optional field name', () => {
    const err = new ValidationError('invalid', 'email');
    expect(err.field).toBe('email');
  });

  it('field is undefined when not provided', () => {
    const err = new ValidationError('invalid');
    expect(err.field).toBeUndefined();
  });
});

describe('NotFoundError', () => {
  it('includes resource and id in the message', () => {
    const err = new NotFoundError('Budget', 42);
    expect(err.message).toBe('Budget with id 42 not found');
    expect(err.statusCode).toBe(404);
  });

  it('omits id from message when not provided', () => {
    const err = new NotFoundError('Budget');
    expect(err.message).toBe('Budget not found');
  });
});

describe('NotFoundForTeamError', () => {
  it('includes resource and teamId in the message', () => {
    const err = new NotFoundForTeamError('Budget', 10);
    expect(err.message).toBe('Budget not found for team with id 10');
    expect(err.statusCode).toBe(404);
  });

  it('omits teamId from message when not provided', () => {
    const err = new NotFoundForTeamError('Budget');
    expect(err.message).toBe('Budget not found');
  });
});

describe('UnauthorizedError', () => {
  it('has statusCode 401 and default message', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('accepts a custom message', () => {
    const err = new UnauthorizedError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('ForbiddenError', () => {
  it('has statusCode 403 and default message', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });

  it('accepts a custom message', () => {
    const err = new ForbiddenError('No access');
    expect(err.message).toBe('No access');
  });
});

describe('ConflictError', () => {
  it('has statusCode 409', () => {
    const err = new ConflictError('already exists');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('already exists');
  });
});

describe('BadRequestError', () => {
  it('has statusCode 400', () => {
    const err = new BadRequestError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad input');
  });
});

describe('ZodValidationError', () => {
  it('formats a single error as "field: message"', () => {
    const err = new ZodValidationError([{ field: 'email', message: 'is required' }]);
    expect(err.message).toBe('email: is required');
    expect(err.field).toBe('email');
  });

  it('formats multiple errors listing field names', () => {
    const err = new ZodValidationError([
      { field: 'email', message: 'is required' },
      { field: 'name', message: 'too short' },
    ]);
    expect(err.message).toBe('Multiple validation errors: email, name');
  });

  it('has statusCode 400', () => {
    const err = new ZodValidationError([{ field: 'x', message: 'bad' }]);
    expect(err.statusCode).toBe(400);
  });
});
