import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvalidTokenError } from '@/models/errors/user/InvalidToken';
import { UserNotFoundError } from '@/models/errors/user/NotFound';
import { AppError } from '@/models/errors/base';

// ─── Mock next/server ────────────────────────────────────────────────────────

const makeHeaders = (init: Record<string, string> = {}) => {
  const store = new Map(Object.entries(init));
  return {
    get: (k: string) => store.get(k) ?? null,
    set: (k: string, v: string) => store.set(k, v),
    _store: store,
  };
};

const makeMockResponse = (body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) => ({
  body,
  status: init.status ?? 200,
  headers: makeHeaders(init.headers ?? {}),
});

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body, init) => makeMockResponse(body, init ?? {})),
  },
  // NextResponse constructor for preflightResponse: new NextResponse(null, {...})
  // vitest calls the default export as a constructor if needed; we handle via the named mock
}));

// We need new NextResponse(null, { status, headers }) for preflightResponse.
// Override the mock to also be constructable.
vi.mock('next/server', () => {
  function NextResponse(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
    return makeMockResponse(body, init);
  }
  NextResponse.json = vi.fn((body: unknown, init: { status?: number } = {}) => makeMockResponse(body, init));
  return { NextResponse };
});

// ─── Mock userService ─────────────────────────────────────────────────────────

vi.mock('@/service/userService', () => ({
  userService: { getUserByToken: vi.fn() },
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { userService } from '@/service/userService';
const {
  getUserDataByToken,
  toApiResponse,
  ok,
  jsonWithCors,
  preflightResponse,
} = await import('@/core/http/ApiHelpers');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(headers: Record<string, string | null> = {}, url = 'http://localhost/api/test') {
  return {
    url,
    headers: {
      get: (key: string) => headers[key.toLowerCase()] ?? null,
    },
  } as unknown as Request;
}

function makeNextRequest(headers: Record<string, string | null> = {}) {
  return makeRequest(headers) as any;
}

// ─── getUserDataByToken ───────────────────────────────────────────────────────

describe('getUserDataByToken', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws InvalidTokenError when Authorization header is missing', async () => {
    await expect(getUserDataByToken(makeNextRequest())).rejects.toThrow(InvalidTokenError);
  });

  it('throws InvalidTokenError when header has no Bearer token', async () => {
    await expect(
      getUserDataByToken(makeNextRequest({ authorization: 'Basic abc123' }))
    ).rejects.toThrow(InvalidTokenError);
  });

  it('throws UserNotFoundError when token is not found', async () => {
    vi.mocked(userService.getUserByToken).mockResolvedValue(null);
    await expect(
      getUserDataByToken(makeNextRequest({ authorization: 'Bearer unknown-token' }))
    ).rejects.toThrow(UserNotFoundError);
  });

  it('returns UserWithTeam when token is valid', async () => {
    vi.mocked(userService.getUserByToken).mockResolvedValue({
      id: 1,
      token: 'tok',
      email: 'a@b.com',
      username: 'u',
      name: 'N',
      createdAt: new Date(),
      teams: [{ id: 10, name: 'My Team' }],
    });
    const result = await getUserDataByToken(makeNextRequest({ authorization: 'Bearer valid-token' }));
    expect(result.user.id).toBe(1);
    expect(result.team.id).toBe(10);
  });
});

// ─── toApiResponse ────────────────────────────────────────────────────────────

describe('toApiResponse', () => {
  it('builds a response with the error status code', () => {
    const err = new AppError('not found', 404);
    const res = toApiResponse(makeNextRequest() as any, err) as any;
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('not found');
    expect(res.body.success).toBe(false);
  });
});

// ─── ok ──────────────────────────────────────────────────────────────────────

describe('ok', () => {
  it('returns status 200 with data and success: true by default', () => {
    const res = ok(makeRequest(), { id: 1 }) as any;
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ id: 1 });
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('OK');
  });

  it('accepts a custom status code', () => {
    const res = ok(makeRequest(), {}, 'Created', 201) as any;
    expect(res.status).toBe(201);
    expect(res.body.message).toBe('Created');
  });
});

// ─── jsonWithCors ─────────────────────────────────────────────────────────────

describe('jsonWithCors', () => {
  it('sets CORS headers for an allowed origin', () => {
    const req = makeRequest({ origin: 'http://localhost:3000' });
    const res = jsonWithCors(req, { data: null, status: 200 } as any) as any;
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    expect(res.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(res.headers.get('Vary')).toBe('Origin');
  });

  it('does not set Allow-Origin for an unknown origin', () => {
    const req = makeRequest({ origin: 'https://evil.com' });
    const res = jsonWithCors(req, { data: null, status: 200 } as any) as any;
    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    expect(res.headers.get('Vary')).toBe('Origin');
  });
});

// ─── preflightResponse ────────────────────────────────────────────────────────

describe('preflightResponse', () => {
  it('returns 204 with CORS headers for an allowed origin', () => {
    const req = makeRequest({
      origin: 'http://localhost:3000',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'Content-Type',
    });
    const res = preflightResponse(req) as any;
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST');
    expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400');
  });

  it('uses "null" as origin for an unknown origin', () => {
    const req = makeRequest({ origin: 'https://evil.com' });
    const res = preflightResponse(req) as any;
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('null');
  });

  it('falls back to default methods and headers when request headers are absent', () => {
    const req = makeRequest({ origin: 'http://localhost:3000' });
    const res = preflightResponse(req) as any;
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    expect(res.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
  });
});
