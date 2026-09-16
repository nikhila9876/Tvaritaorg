import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const testDbPath = path.join(root, 'prisma', 'test.db');
const testDbUrl = `file:${testDbPath.replace(/\\/g, '/')}`;

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDbUrl;
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.INTERNAL_API_KEY = 'test-internal-key';
process.env.PASSWORD_TOKEN_TTL_HOURS = '72';
process.env.BREVO_API_KEY = '';

beforeAll(() => {
  // Recreate an empty SQLite file, then push schema (no --force-reset).
  for (const p of [testDbPath, `${testDbPath}-journal`]) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }

  execSync('npx prisma db push --skip-generate', {
    cwd: root,
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl,
      // Prevent dotenv from overriding with backend/.env (dev.db)
      DOTENV_CONFIG_PATH: path.join(root, '.env.test'),
    },
    stdio: 'pipe',
  });
});

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
  const { prisma } = await import('../src/config/db.js');
  await prisma.$disconnect();
  for (const p of [testDbPath, `${testDbPath}-journal`]) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
});
