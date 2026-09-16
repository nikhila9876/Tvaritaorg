import { prisma } from '../config/db.js';
import { AppError, publicArtist } from '../utils/helpers.js';
import { config } from '../config/index.js';
import { formatFeedback } from './feedbackService.js';

export async function getMyProfile(artist) {
  return publicArtist(artist);
}

export async function getMyBookings(artistId) {
  const bookings = await prisma.booking.findMany({
    where: { artistId },
    include: { event: true },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((b) => ({
    id: b.id,
    event_id: b.eventId,
    status: b.status,
    gross_amount: b.grossAmount,
    guest_name: b.guestName,
    organization: b.organization,
    booking_type: b.bookingType,
    event: b.event
      ? {
          id: b.event.id,
          title: b.event.title,
          date: b.event.date,
          location: b.event.location,
          art_form: b.event.artForm,
        }
      : null,
    created_at: b.createdAt,
  }));
}

export async function getMyRating(artistId) {
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  const reviews = await prisma.feedback.findMany({
    where: { artistId, status: 'approved' },
    orderBy: { createdAt: 'desc' },
  });

  return {
    rating_avg: artist.ratingAvg,
    rating_count: artist.ratingCount,
    reviews: reviews.map(formatFeedback),
  };
}

export async function getMyPayouts(artistId) {
  const payouts = await prisma.payout.findMany({
    where: { artistId },
    include: { event: { select: { id: true, title: true, date: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return payouts.map((p) => ({
    id: p.id,
    event_id: p.eventId,
    gross_amount: p.grossAmount,
    artist_share: p.artistShare,
    share_rate: config.artistShareRate,
    payout_status: p.status,
    paid_at: p.paidAt,
    event: p.event
      ? { id: p.event.id, title: p.event.title, date: p.event.date }
      : null,
  }));
}

export async function getMyTimeslots(artistId) {
  const slots = await prisma.timeSlot.findMany({
    where: { artistId },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
  return slots.map(formatSlot);
}

export async function putMyTimeslots(artistId, timeslots) {
  for (const slot of timeslots) {
    if (slot.end_time <= slot.start_time) {
      throw new AppError('end_time must be after start_time', 400);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.timeSlot.deleteMany({ where: { artistId } });
    await tx.timeSlot.createMany({
      data: timeslots.map((s) => ({
        artistId,
        date: s.date,
        startTime: s.start_time,
        endTime: s.end_time,
        available: s.available !== false,
      })),
    });
  });

  return getMyTimeslots(artistId);
}

/**
 * GET /internal/artists/available?art_form&date
 * Active artists matching art_form with no conflicting unavailable/booked timeslot,
 * sorted by rating_avg descending.
 *
 * Conflict rule (provisional — confirm with Person A):
 * An artist is unavailable on `date` if they have any TimeSlot for that date
 * with available=false, OR they have a confirmed/pending booking on an event
 * with that date.
 */
export async function getAvailableArtists(artForm, date) {
  const artists = await prisma.artist.findMany({
    where: {
      status: 'active',
      artForm: { equals: artForm },
    },
    include: {
      timeslots: { where: { date } },
      bookings: {
        where: {
          status: { in: ['pending', 'confirmed'] },
          event: { date },
        },
        include: { event: true },
      },
    },
  });

  const available = artists.filter((a) => {
    const blockedSlot = a.timeslots.some((t) => t.available === false);
    const hasBookingConflict = a.bookings.length > 0;
    // Also treat "no open available slot" as conflicting only when they marked unavailable.
    // If they have available=true slots or no slots, they are considered available.
    return !blockedSlot && !hasBookingConflict;
  });

  available.sort((a, b) => b.ratingAvg - a.ratingAvg);

  return {
    art_form: artForm,
    date,
    artists: available.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      art_form: a.artForm,
      region: a.region,
      rating_avg: a.ratingAvg,
      rating_count: a.ratingCount,
      status: a.status,
    })),
  };
}

function formatSlot(s) {
  return {
    id: s.id,
    date: s.date,
    start_time: s.startTime,
    end_time: s.endTime,
    available: s.available,
  };
}
