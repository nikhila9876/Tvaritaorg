import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.INTERNAL_API_KEY = 'test-internal-key';
process.env.PASSWORD_TOKEN_TTL_HOURS = '72';
process.env.BREVO_API_KEY = '';

/** @type {import('mongodb-memory-server').MongoMemoryReplSet | undefined} */
let replSet;

/**
 * Prisma `db push` hangs under this agent environment; create unique indexes
 * so P2002 / race protections still work in tests.
 */
async function ensureIndexes(uri) {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const requiredUniques = [
    ['Admin', { email: 1 }],
    ['Artist', { email: 1 }],
    ['PasswordToken', { tokenHash: 1 }],
    ['School', { email: 1 }],
    ['Corporate', { email: 1 }],
    ['TimeSlot', { artistId: 1, date: 1, startTime: 1, endTime: 1 }],
    ['Feedback', { guestEmail: 1, eventId: 1 }],
    ['State', { name: 1 }],
    ['State', { code: 1 }],
    ['ArtistDateHold', { artistId: 1, date: 1 }],
    ['Guest', { email: 1 }],
  ];

  const sparseUniques = [
    ['Payment', { gatewayPaymentId: 1 }],
    ['Payment', { idempotencyKey: 1 }],
  ];

  for (const [coll, keys] of requiredUniques) {
    await db.collection(coll).createIndex(keys, {
      unique: true,
      name: `${Object.keys(keys).join('_')}_key`,
    });
  }
  for (const [coll, keys] of sparseUniques) {
    await db.collection(coll).createIndex(keys, {
      unique: true,
      sparse: true,
      name: `${Object.keys(keys).join('_')}_key`,
    });
  }

  await client.close();
}

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  const uri = replSet.getUri('tvarita_test');
  process.env.DATABASE_URL = uri;

  const { resetPrismaClient } = await import('../src/config/db.js');
  await resetPrismaClient();
  await ensureIndexes(uri);
}, 120000);

beforeEach(async () => {
  const { prisma } = await import('../src/config/db.js');
  await prisma.notificationLog.deleteMany();
  await prisma.passwordToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.artistDateHold.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.event.deleteMany();
  await prisma.state.deleteMany();
  await prisma.guestOtp.deleteMany();
  await prisma.guest.deleteMany();
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
