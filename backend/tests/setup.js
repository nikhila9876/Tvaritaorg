import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.INTERNAL_API_KEY = 'test-internal-key';
process.env.PASSWORD_TOKEN_TTL_HOURS = '72';
process.env.BREVO_API_KEY = '';

/** @type {import('mongodb-memory-server').MongoMemoryReplSet | undefined} */
let replSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri('tvarita_test');
  process.env.DATABASE_URL = uri;

  const { resetPrismaClient } = await import('../src/config/db.js');
  await resetPrismaClient();

  execSync('npx prisma db push --skip-generate', {
    cwd: root,
    env: { ...process.env, DATABASE_URL: uri },
    stdio: 'pipe',
  });
}, 120000);

beforeEach(async () => {
  const { prisma } = await import('../src/config/db.js');
  await prisma.notificationLog.deleteMany();
  await prisma.passwordToken.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.event.deleteMany();
  await prisma.artist.deleteMany();
  await prisma.school.deleteMany();
  await prisma.corporate.deleteMany();
  await prisma.admin.deleteMany();
});

afterAll(async () => {
  const { prisma, resetPrismaClient } = await import('../src/config/db.js');
  await prisma.$disconnect().catch(() => {});
  await resetPrismaClient();
  if (replSet) await replSet.stop();
}, 60000);
