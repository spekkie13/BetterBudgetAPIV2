import { vi } from 'vitest';

/**
 * Creates a fluent drizzle-ORM-style mock chain.
 * `result` is what the terminal operation resolves to.
 * The chain itself is thenable so `await chain.where(...)` works too.
 */
export function makeChain(result: any[] = []) {
  const chain: any = {
    from: vi.fn(),
    where: vi.fn(),
    innerJoin: vi.fn(),
    values: vi.fn(),
    set: vi.fn(),
    limit: vi.fn().mockResolvedValue(result),
    returning: vi.fn().mockResolvedValue(result),
    then(resolve: (v: any) => any, reject: (e: any) => any) {
      return Promise.resolve(result).then(resolve, reject);
    },
    catch(fn: (e: any) => any) {
      return Promise.resolve(result).catch(fn);
    },
  };

  chain.from.mockReturnValue(chain);
  chain.where.mockReturnValue(chain);
  chain.innerJoin.mockReturnValue(chain);
  chain.values.mockReturnValue(chain);
  chain.set.mockReturnValue(chain);

  return chain;
}