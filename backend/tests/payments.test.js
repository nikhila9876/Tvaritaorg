import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';
import { releaseExpiredHolds } from '../src/services/personA/paymentService.js';
import { config } from '../src/config/index.js';

const app = createApp();
const INTERNAL = config.internalApiKey;

describe('Payments idempotency and holds', () => {
  test('webhook success is idempotent and records 70/30 split once', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'pay-artist@example.com',
        name: 'Pay Artist',
        artForm: 'Warli',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });
    const event = await prisma.event.create({
      data: { title: 'Paid Event', artForm: 'Warli', date: '2026-10-05' },
    });
    const booking = await prisma.booking.create({
      data: {
        eventId: event.id,
        artistId: artist.id,
        guestEmail: 'payer@example.com',
        guestName: 'Payer',
        bookingType: 'individual',
        status: 'hold',
        headcount: 2,
        grossAmount: 400,
        date: '2026-10-05',
      },
    });

    const created = await request(app)
      .post('/api/payments/create')
      .send({ booking_id: booking.id, idempotency_key: 'idem-pay-1' });
    expect(created.status).toBe(201);
    expect(created.body.payment.amount).toBe(400);

    const again = await request(app)
      .post('/api/payments/create')
      .send({ booking_id: booking.id, idempotency_key: 'idem-pay-1' });
    expect(again.body.payment.id).toBe(created.body.payment.id);

    const webhookBody = {
      payment_id: created.body.payment.id,
      gateway_payment_id: 'gw_pay_1',
      status: 'succeeded',
    };

    const first = await request(app).post('/api/payments/webhook').send(webhookBody);
    expect(first.status).toBe(200);
    expect(first.body.idempotent).toBe(false);

    const second = await request(app).post('/api/payments/webhook').send(webhookBody);
    expect(second.status).toBe(200);
    expect(second.body.idempotent).toBe(true);

    const payouts = await prisma.payout.findMany({ where: { bookingId: booking.id } });
    expect(payouts).toHaveLength(1);
    expect(payouts[0].artistShare).toBe(280);

    const refreshed = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(refreshed.status).toBe('confirmed');
  });

  test('release-expired-holds frees unpaid individual slot locks', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'hold@example.com',
        name: 'Hold Artist',
        artForm: 'Warli',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });
    const slot = await prisma.timeSlot.create({
      data: {
        artistId: artist.id,
        date: '2026-10-06',
        startTime: '09:00',
        endTime: '10:00',
        available: false,
        lockedUntil: new Date(Date.now() - 60_000),
      },
    });
    const booking = await prisma.booking.create({
      data: {
        artistId: artist.id,
        slotId: slot.id,
        guestEmail: 'late@example.com',
        bookingType: 'individual',
        status: 'hold',
        holdExpiresAt: new Date(Date.now() - 60_000),
        headcount: 1,
        grossAmount: 200,
        date: '2026-10-06',
      },
    });
    await prisma.timeSlot.update({
      where: { id: slot.id },
      data: { lockedByBookingId: booking.id },
    });

    const viaInternal = await request(app)
      .post('/internal/jobs/release-expired-holds')
      .set('x-internal-api-key', INTERNAL);

    expect(viaInternal.status).toBe(200);
    expect(viaInternal.body.released_slot_holds).toBeGreaterThanOrEqual(1);

    const refreshedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(refreshedBooking.status).toBe('cancelled');
    const refreshedSlot = await prisma.timeSlot.findUnique({ where: { id: slot.id } });
    expect(refreshedSlot.available).toBe(true);

    // Direct call still safe
    const again = await releaseExpiredHolds();
    expect(again.released_slot_holds).toBe(0);
  });
});
