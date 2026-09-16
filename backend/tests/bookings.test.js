import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

const app = createApp();

async function seedArtistWithSlot() {
  const artist = await prisma.artist.create({
    data: {
      email: 'slot@example.com',
      name: 'Slot Artist',
      artForm: 'Warli',
      passwordHash: await hashPassword('x'),
      status: 'active',
      passwordSet: true,
      ratingAvg: 4.9,
      ratingCount: 5,
    },
  });
  const slot = await prisma.timeSlot.create({
    data: {
      artistId: artist.id,
      date: '2026-10-20',
      startTime: '10:00',
      endTime: '12:00',
      available: true,
    },
  });
  return { artist, slot };
}

describe('Bookings concurrency', () => {
  test('only one of two concurrent individual bookings locks the same slot', async () => {
    const { artist, slot } = await seedArtistWithSlot();

    const payload = {
      artist_id: artist.id,
      slot_id: slot.id,
      guest_email: 'a@example.com',
      headcount: 2,
    };
    const payload2 = { ...payload, guest_email: 'b@example.com' };

    const [r1, r2] = await Promise.all([
      request(app).post('/api/bookings/individual').send(payload),
      request(app).post('/api/bookings/individual').send(payload2),
    ]);

    const statuses = [r1.status, r2.status].sort((a, b) => a - b);
    // One winner (201); loser is 409 (slot taken or write conflict)
    expect(statuses[0]).toBe(201);
    expect(statuses[1]).toBe(409);

    const holds = await prisma.booking.findMany({ where: { slotId: slot.id } });
    expect(holds).toHaveLength(1);
    expect(holds[0].status).toBe('hold');
    expect(holds[0].grossAmount).toBe(400);

    const refreshed = await prisma.timeSlot.findUnique({ where: { id: slot.id } });
    expect(refreshed.available).toBe(false);
  });

  test('two concurrent corporate bookings cannot claim the same top-rated artist+date', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'corp-artist@example.com',
        name: 'Top Rated',
        artForm: 'Madhubani',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
        ratingAvg: 5,
        ratingCount: 10,
      },
    });

    await prisma.corporate.create({
      data: {
        email: 'corp1@example.com',
        name: 'Coord 1',
        companyName: 'Acme One',
      },
    });
    await prisma.corporate.create({
      data: {
        email: 'corp2@example.com',
        name: 'Coord 2',
        companyName: 'Acme Two',
      },
    });

    // Ensure available: no blocked slots
    void artist;

    const body1 = {
      corporate_email: 'corp1@example.com',
      art_form: 'Madhubani',
      date: '2026-11-01',
      headcount: 10,
    };
    const body2 = {
      corporate_email: 'corp2@example.com',
      art_form: 'Madhubani',
      date: '2026-11-01',
      headcount: 10,
    };

    const [c1, c2] = await Promise.all([
      request(app).post('/api/bookings/corporate').send(body1),
      request(app).post('/api/bookings/corporate').send(body2),
    ]);

    expect([c1.status, c2.status].every((s) => s === 201 || s === 409)).toBe(true);

    const bodies = [c1, c2].filter((r) => r.status === 201).map((r) => r.body.booking);
    // At most one assigned artist for the date; the other is pending-admin or 409
    const assigned = bodies.filter(
      (b) => b.status === 'awaiting_payment' && b.artist_id,
    );
    const pending = bodies.filter(
      (b) => b.status === 'no_artist_available_pending_admin',
    );

    expect(assigned.length + pending.length).toBeGreaterThanOrEqual(1);
    expect(assigned.length).toBeLessThanOrEqual(1);

    const holds = await prisma.artistDateHold.findMany({
      where: { date: '2026-11-01' },
    });
    expect(holds.length).toBeLessThanOrEqual(1);
    if (assigned.length === 1) {
      expect(holds).toHaveLength(1);
      expect(assigned[0].gross_amount).toBe(5000);
    }
  });

  test('two concurrent school bookings cannot claim the same artist+date', async () => {
    await prisma.artist.create({
      data: {
        email: 'school-artist@example.com',
        name: 'School Artist',
        artForm: 'Warli',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
        ratingAvg: 4.5,
        ratingCount: 3,
      },
    });
    await prisma.school.create({
      data: { email: 'school-a@example.com', name: 'School A' },
    });
    await prisma.school.create({
      data: { email: 'school-b@example.com', name: 'School B' },
    });

    const body1 = {
      school_email: 'school-a@example.com',
      art_form: 'Warli',
      date: '2026-11-15',
      headcount: 30,
    };
    const body2 = {
      school_email: 'school-b@example.com',
      art_form: 'Warli',
      date: '2026-11-15',
      headcount: 25,
    };

    const [s1, s2] = await Promise.all([
      request(app).post('/api/bookings/school').send(body1),
      request(app).post('/api/bookings/school').send(body2),
    ]);

    expect([s1.status, s2.status].every((s) => s === 201 || s === 409)).toBe(true);

    const bodies = [s1, s2].filter((r) => r.status === 201).map((r) => r.body.booking);
    const assigned = bodies.filter(
      (b) => b.status === 'awaiting_payment' && b.artist_id,
    );
    expect(assigned.length).toBeLessThanOrEqual(1);

    const holds = await prisma.artistDateHold.findMany({
      where: { date: '2026-11-15' },
    });
    expect(holds.length).toBeLessThanOrEqual(1);
  });

  test('school with no available artists creates pending-admin booking without event', async () => {
    await prisma.school.create({
      data: { email: 'school@example.com', name: 'Demo School' },
    });

    const res = await request(app).post('/api/bookings/school').send({
      school_email: 'school@example.com',
      art_form: 'Gond',
      date: '2026-12-01',
      headcount: 40,
    });

    expect(res.status).toBe(201);
    expect(res.body.booking.status).toBe('no_artist_available_pending_admin');
    expect(res.body.booking.event_id).toBeNull();
    expect(res.body.booking.gross_amount).toBe(2000);
  });
});
