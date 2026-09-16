import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

const app = createApp();
const INTERNAL_KEY = 'test-internal-key';

async function seedArtists() {
  const high = await prisma.artist.create({
    data: {
      email: 'high@example.com',
      name: 'High Rated',
      artForm: 'Madhubani',
      passwordHash: await hashPassword('x'),
      status: 'active',
      passwordSet: true,
      ratingAvg: 4.8,
      ratingCount: 10,
    },
  });

  const mid = await prisma.artist.create({
    data: {
      email: 'mid@example.com',
      name: 'Mid Rated',
      artForm: 'Madhubani',
      passwordHash: await hashPassword('x'),
      status: 'active',
      passwordSet: true,
      ratingAvg: 4.2,
      ratingCount: 5,
    },
  });

  const blocked = await prisma.artist.create({
    data: {
      email: 'blocked@example.com',
      name: 'Blocked',
      artForm: 'Madhubani',
      passwordHash: await hashPassword('x'),
      status: 'active',
      passwordSet: true,
      ratingAvg: 5,
      ratingCount: 3,
    },
  });

  const inactive = await prisma.artist.create({
    data: {
      email: 'inactive@example.com',
      name: 'Inactive',
      artForm: 'Madhubani',
      passwordHash: await hashPassword('x'),
      status: 'inactive',
      passwordSet: true,
      ratingAvg: 5,
      ratingCount: 20,
    },
  });

  const otherForm = await prisma.artist.create({
    data: {
      email: 'warli@example.com',
      name: 'Warli Artist',
      artForm: 'Warli',
      passwordHash: await hashPassword('x'),
      status: 'active',
      passwordSet: true,
      ratingAvg: 5,
      ratingCount: 8,
    },
  });

  await prisma.timeSlot.create({
    data: {
      artistId: blocked.id,
      date: '2026-10-01',
      startTime: '10:00',
      endTime: '12:00',
      available: false,
    },
  });

  return { high, mid, blocked, inactive, otherForm };
}

describe('GET /internal/artists/available contract', () => {
  test('returns active matching artists sorted by rating desc, excluding conflicts', async () => {
    const { high, mid, blocked, inactive, otherForm } = await seedArtists();

    const res = await request(app)
      .get('/internal/artists/available')
      .query({ art_form: 'Madhubani', date: '2026-10-01' })
      .set('x-internal-api-key', INTERNAL_KEY);

    expect(res.status).toBe(200);
    expect(res.body.art_form).toBe('Madhubani');
    expect(res.body.date).toBe('2026-10-01');
    expect(Array.isArray(res.body.artists)).toBe(true);

    const ids = res.body.artists.map((a) => a.id);
    expect(ids).toEqual([high.id, mid.id]);
    expect(ids).not.toContain(blocked.id);
    expect(ids).not.toContain(inactive.id);
    expect(ids).not.toContain(otherForm.id);

    expect(res.body.artists[0]).toMatchObject({
      id: high.id,
      name: 'High Rated',
      email: 'high@example.com',
      art_form: 'Madhubani',
      rating_avg: 4.8,
      rating_count: 10,
      status: 'active',
    });
  });

  test('requires internal API key and validates query params', async () => {
    const unauthorized = await request(app)
      .get('/internal/artists/available')
      .query({ art_form: 'Madhubani', date: '2026-10-01' });
    expect(unauthorized.status).toBe(401);

    const badQuery = await request(app)
      .get('/internal/artists/available')
      .query({ art_form: 'Madhubani', date: '01-10-2026' })
      .set('x-internal-api-key', INTERNAL_KEY);
    expect(badQuery.status).toBe(400);
  });
});
