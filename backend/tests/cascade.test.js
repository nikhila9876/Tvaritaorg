import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';
import {
  deleteArtistWithCascade,
  deleteEventWithCascade,
} from '../src/services/cascadeService.js';

describe('MongoDB application-level cascades', () => {
  test('deleteArtistWithCascade removes children and nulls booking.artistId', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'cascade-artist@example.com',
        name: 'Cascade Artist',
        artForm: 'Warli',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });

    const event = await prisma.event.create({
      data: { title: 'Keep me', date: '2026-11-01', artForm: 'Warli' },
    });

    await prisma.passwordToken.create({
      data: {
        artistId: artist.id,
        tokenHash: 'token-hash-1',
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    await prisma.timeSlot.create({
      data: {
        artistId: artist.id,
        date: '2026-11-01',
        startTime: '09:00',
        endTime: '11:00',
      },
    });
    await prisma.feedback.create({
      data: {
        artistId: artist.id,
        eventId: event.id,
        guestEmail: 'g@example.com',
        rating: 5,
      },
    });
    await prisma.payout.create({
      data: {
        artistId: artist.id,
        eventId: event.id,
        grossAmount: 1000,
        artistShare: 700,
      },
    });
    const booking = await prisma.booking.create({
      data: {
        eventId: event.id,
        artistId: artist.id,
        status: 'confirmed',
        grossAmount: 1000,
      },
    });

    await deleteArtistWithCascade(artist.id);

    expect(await prisma.artist.findUnique({ where: { id: artist.id } })).toBeNull();
    expect(await prisma.passwordToken.count({ where: { artistId: artist.id } })).toBe(0);
    expect(await prisma.timeSlot.count({ where: { artistId: artist.id } })).toBe(0);
    expect(await prisma.feedback.count({ where: { artistId: artist.id } })).toBe(0);
    expect(await prisma.payout.count({ where: { artistId: artist.id } })).toBe(0);

    const refreshedBooking = await prisma.booking.findUnique({ where: { id: booking.id } });
    expect(refreshedBooking).not.toBeNull();
    expect(refreshedBooking.artistId).toBeNull();
    expect(await prisma.event.findUnique({ where: { id: event.id } })).not.toBeNull();
  });

  test('deleteEventWithCascade removes bookings, payouts, and feedback for event', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'event-cascade@example.com',
        name: 'Event Cascade',
        artForm: 'Madhubani',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });
    const event = await prisma.event.create({
      data: { title: 'Delete me', date: '2026-12-01', artForm: 'Madhubani' },
    });

    await prisma.booking.create({
      data: { eventId: event.id, artistId: artist.id, status: 'pending', grossAmount: 500 },
    });
    await prisma.payout.create({
      data: {
        artistId: artist.id,
        eventId: event.id,
        grossAmount: 500,
        artistShare: 350,
      },
    });
    await prisma.feedback.create({
      data: {
        artistId: artist.id,
        eventId: event.id,
        guestEmail: 'fb@example.com',
        rating: 3,
      },
    });

    await deleteEventWithCascade(event.id);

    expect(await prisma.event.findUnique({ where: { id: event.id } })).toBeNull();
    expect(await prisma.booking.count({ where: { eventId: event.id } })).toBe(0);
    expect(await prisma.payout.count({ where: { eventId: event.id } })).toBe(0);
    expect(await prisma.feedback.count({ where: { eventId: event.id } })).toBe(0);
    expect(await prisma.artist.findUnique({ where: { id: artist.id } })).not.toBeNull();
  });
});
