import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/helpers.js';
import { getAvailableArtists } from '../artistSelfService.js';
import {
  computeGrossAmount,
  SLOT_HOLD_MINUTES,
} from '../../constants/pricing.js';

function formatBooking(b) {
  return {
    id: b.id,
    event_id: b.eventId,
    artist_id: b.artistId,
    slot_id: b.slotId,
    guest_email: b.guestEmail,
    guest_name: b.guestName,
    organization: b.organization,
    booking_type: b.bookingType,
    status: b.status,
    headcount: b.headcount,
    gross_amount: b.grossAmount,
    art_form: b.artForm,
    date: b.date,
    hold_expires_at: b.holdExpiresAt,
    payment_window_expires_at: b.paymentWindowExpiresAt,
    school_id: b.schoolId,
    corporate_id: b.corporateId,
    created_at: b.createdAt,
  };
}

/**
 * Atomically lock a TimeSlot for an individual booking (Mongo transaction).
 * Concurrent requests for the same slot: only one succeeds (409 for the rest).
 */
export async function createIndividualBooking({
  artistId,
  slotId,
  guestEmail,
  guestName,
  headcount = 1,
}) {
  const pricing = computeGrossAmount('individual', headcount);
  const holdExpiresAt = new Date(Date.now() + SLOT_HOLD_MINUTES * 60 * 1000);

  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const booking = await prisma.$transaction(async (tx) => {
        const slot = await tx.timeSlot.findUnique({ where: { id: slotId } });
        if (!slot) throw new AppError('Time slot not found', 404);
        if (slot.artistId !== artistId) {
          throw new AppError('Slot does not belong to this artist', 400);
        }

        const lockResult = await tx.timeSlot.updateMany({
          where: { id: slotId, available: true },
          data: {
            available: false,
            lockedUntil: holdExpiresAt,
          },
        });

        if (lockResult.count !== 1) {
          throw new AppError('Slot is already locked or unavailable', 409);
        }

        const created = await tx.booking.create({
          data: {
            artistId,
            slotId,
            guestEmail: guestEmail.toLowerCase(),
            guestName: guestName || null,
            bookingType: 'individual',
            status: 'hold',
            headcount,
            grossAmount: pricing.gross_amount,
            artForm: null,
            date: slot.date,
            holdExpiresAt,
          },
        });

        await tx.timeSlot.update({
          where: { id: slotId },
          data: { lockedByBookingId: created.id },
        });

        return created;
      });

      return formatBooking(booking);
    } catch (err) {
      if (err instanceof AppError && err.status === 409) {
        lastError = err;
        break;
      }
      if (err instanceof AppError) throw err;
      if (err.code === 'P2034') {
        lastError = new AppError('Slot is already locked or unavailable', 409);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new AppError('Slot is already locked or unavailable', 409);
}

/**
 * School booking: lookup School, call Person B available artists (in-process =
 * GET /internal/artists/available). Empty → pending-admin, no Event.
 */
export async function createSchoolBooking({
  schoolEmail,
  artForm,
  date,
  headcount,
  guestName,
  location,
}) {
  const school = await prisma.school.findUnique({
    where: { email: schoolEmail.toLowerCase() },
  });
  if (!school) throw new AppError('School not found — upload via admin CSV first', 404);

  const pricing = computeGrossAmount('school', headcount);
  const available = await getAvailableArtists(artForm, date);

  if (!available.artists.length) {
    const booking = await prisma.booking.create({
      data: {
        schoolId: school.id,
        guestEmail: school.email,
        guestName: guestName || school.contact || school.name,
        organization: school.name,
        bookingType: 'school',
        status: 'no_artist_available_pending_admin',
        headcount,
        grossAmount: pricing.gross_amount,
        artForm,
        date,
      },
    });
    return formatBooking(booking);
  }

  return assignAndCreateOrgBooking({
    bookingType: 'school',
    artists: available.artists,
    artForm,
    date,
    headcount,
    grossAmount: pricing.gross_amount,
    guestEmail: school.email,
    guestName: guestName || school.contact || school.name,
    organization: school.name,
    schoolId: school.id,
    location,
  });
}

/**
 * Corporate booking — same as school; Person B sorts by rating_avg desc
 * (confirmed in getAvailableArtists). Atomic artist+date assignment.
 */
export async function createCorporateBooking({
  corporateEmail,
  artForm,
  date,
  headcount,
  guestName,
  location,
}) {
  const corporate = await prisma.corporate.findUnique({
    where: { email: corporateEmail.toLowerCase() },
  });
  if (!corporate) {
    throw new AppError('Corporate not found — upload via admin CSV first', 404);
  }

  const pricing = computeGrossAmount('corporate', headcount);
  const available = await getAvailableArtists(artForm, date);

  if (!available.artists.length) {
    const booking = await prisma.booking.create({
      data: {
        corporateId: corporate.id,
        guestEmail: corporate.email,
        guestName: guestName || corporate.name,
        organization: corporate.companyName,
        bookingType: 'corporate',
        status: 'no_artist_available_pending_admin',
        headcount,
        grossAmount: pricing.gross_amount,
        artForm,
        date,
      },
    });
    return formatBooking(booking);
  }

  // Prefer highest rating first (Person B already sorts desc; re-assert).
  const sorted = [...available.artists].sort(
    (a, b) => (b.rating_avg || 0) - (a.rating_avg || 0),
  );

  return assignAndCreateOrgBooking({
    bookingType: 'corporate',
    artists: sorted,
    artForm,
    date,
    headcount,
    grossAmount: pricing.gross_amount,
    guestEmail: corporate.email,
    guestName: guestName || corporate.name,
    organization: corporate.companyName,
    corporateId: corporate.id,
    location,
  });
}

/**
 * Try artists in order; atomically claim artist+date via ArtistDateHold unique index
 * so two concurrent corporate/school requests cannot both assign the same artist.
 */
async function assignAndCreateOrgBooking({
  bookingType,
  artists,
  artForm,
  date,
  headcount,
  grossAmount,
  guestEmail,
  guestName,
  organization,
  schoolId,
  corporateId,
  location,
}) {
  for (const candidate of artists) {
    try {
      const booking = await prisma.$transaction(async (tx) => {
        try {
          await tx.artistDateHold.create({
            data: { artistId: candidate.id, date },
          });
        } catch (err) {
          if (err.code === 'P2002') {
            throw new AppError('Artist already assigned for this date', 409);
          }
          throw err;
        }

        const event = await tx.event.create({
          data: {
            title: `${bookingType} — ${artForm} — ${date}`,
            artForm,
            date,
            location: location || null,
          },
        });

        const created = await tx.booking.create({
          data: {
            eventId: event.id,
            artistId: candidate.id,
            guestEmail,
            guestName,
            organization,
            bookingType,
            status: 'awaiting_payment',
            headcount,
            grossAmount,
            artForm,
            date,
            schoolId: schoolId || null,
            corporateId: corporateId || null,
          },
        });

        await tx.artistDateHold.update({
          where: {
            artistId_date: { artistId: candidate.id, date },
          },
          data: { bookingId: created.id },
        });

        return created;
      });

      return formatBooking(booking);
    } catch (err) {
      if (err instanceof AppError && err.status === 409) {
        continue;
      }
      // Write conflict / unique violation = another request won the race
      if (err.code === 'P2034' || err.code === 'P2002') {
        continue;
      }
      throw err;
    }
  }

  // All candidates raced away — fall back to pending admin
  const booking = await prisma.booking.create({
    data: {
      guestEmail,
      guestName,
      organization,
      bookingType,
      status: 'no_artist_available_pending_admin',
      headcount,
      grossAmount,
      artForm,
      date,
      schoolId: schoolId || null,
      corporateId: corporateId || null,
    },
  });
  return formatBooking(booking);
}

export async function getBookingById(bookingId) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true, artist: true },
  });
  if (!booking) throw new AppError('Booking not found', 404);
  return {
    ...formatBooking(booking),
    event: booking.event
      ? {
          id: booking.event.id,
          title: booking.event.title,
          date: booking.event.date,
          art_form: booking.event.artForm,
        }
      : null,
    artist: booking.artist
      ? {
          id: booking.artist.id,
          name: booking.artist.name,
          rating_avg: booking.artist.ratingAvg,
        }
      : null,
  };
}

export async function getBookingStatus(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', 404);
  return {
    booking_id: booking.id,
    status: booking.status,
    hold_expires_at: booking.holdExpiresAt,
    payment_window_expires_at: booking.paymentWindowExpiresAt,
  };
}
