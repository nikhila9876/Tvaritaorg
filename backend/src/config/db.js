import { PrismaClient } from '@prisma/client';

let client;

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'test' ? [] : ['error', 'warn'],
  });
}

function getClient() {
  if (!client) {
    client = globalThis.prisma ?? createClient();
    if (process.env.NODE_ENV !== 'production') {
      globalThis.prisma = client;
    }
  }
  return client;
}

/** Drop the cached client so the next call picks up a new DATABASE_URL (tests). */
export async function resetPrismaClient() {
  if (client) {
    await client.$disconnect().catch(() => {});
  }
  client = undefined;
  globalThis.prisma = undefined;
}

/**
 * Lazy Prisma proxy — constructed after DATABASE_URL is set (important for Mongo tests).
 */
export const prisma = new Proxy(
  {},
  {
    get(_target, prop) {
      const c = getClient();
      const value = c[prop];
      return typeof value === 'function' ? value.bind(c) : value;
    },
  },
);
