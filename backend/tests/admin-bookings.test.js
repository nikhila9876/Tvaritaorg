import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';
import { signToken } from '../src/utils/jwt.js';

const app = createApp();

async function seedAdmin() {
  const passwordHash = await bcrypt.hash('AdminPass123!', 10);
  return prisma.admin.create({
    data: { email: 'admin-closeout@tvarita.org', passwordHash, name: 'Admin' },
  });
}

function adminToken(admin) {
  return signToken({ sub: admin.id, role: 'admin', email: admin.email });
}

describe('Admin bookings + pending-admin assign', () => {
  test('GET /api/admin/bookings?status= filters Person A statuses', async () => {
    const admin = await seedAdmin();
    const token = adminToken(admin);

    await prisma.booking.create({
      data: {
        guestEmail: 'hold@example.com',
        bookingType: 'individual',
        status: 'hold',
        headcount: 1,
        grossAmount: 200,
        date: '2026-10-01',
      },
    });
    await prisma.booking.create({
      data: {
        guestEmail: 'pending@example.com',
        bookingType: 'school',
        status: 'no_artist_available_pending_admin',
        headcount: 20,
        grossAmount: 1000,
        artForm: 'Warli',
        date: '2026-10-02',
      },
    });
    await prisma.booking.create({
      data: {
        guestEmail: 'ok@example.com',
        bookingType: 'corporate',
        status: 'confirmed',
        headcount: 5,
        grossAmount: 2500,
        date: '2026-10-03',
      },
    });

    const pending = await request(app)
      .get('/api/admin/bookings')
      .query({ status: 'no_artist_available_pending_admin' })
      .set('Authorization', `Bearer ${token}`);

    expect(pending.status).toBe(200);
    expect(pending.body.bookings).toHaveLength(1);
    expect(pending.body.bookings[0].status).toBe(
      'no_artist_available_pending_admin',
    );
    expect(pending.body.bookings[0].event_id).toBeNull();

    const hold = await request(app)
      .get('/api/admin/bookings')
      .query({ status: 'hold' })
      .set('Authorization', `Bearer ${token}`);
    expect(hold.body.bookings).toHaveLength(1);
    expect(hold.body.bookings[0].status).toBe('hold');
  });

  test('pending-admin without Event uses booking_id assign, not event_id', async () => {
    const admin = await seedAdmin();
    const token = adminToken(admin);

    const artist = await prisma.artist.create({
      data: {
        email: 'assign-me@example.com',
        name: 'Assignable',
        artForm: 'Madhubani',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });

    const booking = await prisma.booking.create({
      data: {
        guestEmail: 'school2@example.com',
        bookingType: 'school',
        status: 'no_artist_available_pending_admin',
        headcount: 10,
        grossAmount: 500,
        artForm: 'Madhubani',
        date: '2026-10-15',
      },
    });

    const orphanEvent = await prisma.event.create({
      data: { title: 'Unrelated', date: '2026-10-15', artForm: 'Madhubani' },
    });

    const viaEvent = await request(app)
      .post(`/api/admin/events/${orphanEvent.id}/assign-artist`)
      .set('Authorization', `Bearer ${token}`)
      .send({ artist_id: artist.id });
    expect(viaEvent.status).toBe(404);
    expect(viaEvent.body.details?.path).toContain('/api/admin/bookings/');

    const viaBooking = await request(app)
      .post(`/api/admin/bookings/${booking.id}/assign-artist`)
      .set('Authorization', `Bearer ${token}`)
      .send({ artist_id: artist.id });

    expect(viaBooking.status).toBe(200);
    expect(viaBooking.body.status).toBe('awaiting_payment');
    expect(viaBooking.body.artist_id).toBe(artist.id);
    expect(viaBooking.body.event_id).toBeTruthy();
    expect(viaBooking.body.payment_window_expires_at).toBeTruthy();
  });
});
