import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { signToken } from '../src/utils/jwt.js';

const app = createApp();

async function seedAdmin() {
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  return prisma.admin.create({
    data: {
      email: 'admin@tvarita.org',
      passwordHash,
      name: 'Admin',
    },
  });
}

function adminToken(admin) {
  return signToken({ sub: admin.id, role: 'admin', email: admin.email });
}

describe('Artist CSV upload dedupe', () => {
  test('upserts on duplicate email instead of creating a second row', async () => {
    const admin = await seedAdmin();
    const token = adminToken(admin);

    const csv1 = [
      'email,name,phone,art_form,region,bio',
      'artist1@example.com,Ravi Kumar,9876543210,Madhubani,Bihar,Painter',
    ].join('\n');

    const first = await request(app)
      .post('/api/admin/artists/csv-upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv1), 'artists.csv');

    expect(first.status).toBe(200);
    expect(first.body.created).toBe(1);
    expect(first.body.updated).toBe(0);

    const csv2 = [
      'email,name,phone,art_form,region,bio',
      'artist1@example.com,Ravi Updated,9876543210,Madhubani,Patna,Updated bio',
    ].join('\n');

    const second = await request(app)
      .post('/api/admin/artists/csv-upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv2), 'artists.csv');

    expect(second.status).toBe(200);
    expect(second.body.created).toBe(0);
    expect(second.body.updated).toBe(1);

    const artists = await prisma.artist.findMany({
      where: { email: 'artist1@example.com' },
    });
    expect(artists).toHaveLength(1);
    expect(artists[0].name).toBe('Ravi Updated');
    expect(artists[0].region).toBe('Patna');
    expect(artists[0].status).toBe('active');
  });

  test('rejects entire batch when any row is malformed', async () => {
    const admin = await seedAdmin();
    const token = adminToken(admin);

    const csv = [
      'email,name,phone,art_form,region,bio',
      'good@example.com,Good Artist,9876543210,Warli,Maharashtra,ok',
      'not-an-email,Bad Artist,9876543211,Warli,Maharashtra,bad',
    ].join('\n');

    const res = await request(app)
      .post('/api/admin/artists/csv-upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(csv), 'artists.csv');

    expect(res.status).toBe(400);
    expect(res.body.details?.rowErrors?.length).toBeGreaterThan(0);

    const count = await prisma.artist.count();
    expect(count).toBe(0);
  });
});
