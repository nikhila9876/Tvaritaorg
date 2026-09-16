import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import { AppError, publicArtist } from '../utils/helpers.js';
import { parseCsvBuffer, validateCsvRows } from '../utils/csv.js';
import {
  corporateCsvRowSchema,
  schoolCsvRowSchema,
} from '../validators/schemas.js';

export async function listArtists() {
  const artists = await prisma.artist.findMany({ orderBy: { createdAt: 'desc' } });
  return artists.map(publicArtist);
}

export async function getArtistById(id) {
  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) throw new AppError('Artist not found', 404);
  return publicArtist(artist);
}

export async function deactivateArtist(id) {
  const artist = await prisma.artist.findUnique({ where: { id } });
  if (!artist) throw new AppError('Artist not found', 404);
  const updated = await prisma.artist.update({
    where: { id },
    data: { status: 'inactive' },
  });
  return publicArtist(updated);
}

export async function importSchoolsFromCsv(buffer) {
  const rows = parseCsvBuffer(buffer, {
    columns: ['email', 'name', 'phone', 'city', 'contact'],
    requiredColumns: ['email', 'name'],
  });

  const validRows = validateCsvRows(rows, (data) => {
    const parsed = schoolCsvRowSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      };
    }
    return {
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        city: parsed.data.city || null,
        contact: parsed.data.contact || null,
      },
    };
  });

  const results = await prisma.$transaction(async (tx) => {
    const out = [];
    for (const row of validRows) {
      const existing = await tx.school.findUnique({ where: { email: row.data.email } });
      if (existing) {
        const updated = await tx.school.update({
          where: { id: existing.id },
          data: row.data,
        });
        out.push({ email: row.data.email, action: 'updated', id: updated.id });
      } else {
        const created = await tx.school.create({ data: row.data });
        out.push({ email: row.data.email, action: 'created', id: created.id });
      }
    }
    return out;
  });

  return summarizeImport(results);
}

export async function importCorporatesFromCsv(buffer) {
  const rows = parseCsvBuffer(buffer, {
    columns: ['email', 'name', 'org_id', 'company_name', 'phone'],
    requiredColumns: ['email', 'name', 'company_name'],
  });

  const validRows = validateCsvRows(rows, (data) => {
    const parsed = corporateCsvRowSchema.safeParse(data);
    if (!parsed.success) {
      return {
        error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      };
    }
    return {
      data: {
        email: parsed.data.email.toLowerCase(),
        name: parsed.data.name,
        orgId: parsed.data.org_id || null,
        companyName: parsed.data.company_name,
        phone: parsed.data.phone || null,
      },
    };
  });

  const results = await prisma.$transaction(async (tx) => {
    const out = [];
    for (const row of validRows) {
      const existing = await tx.corporate.findUnique({ where: { email: row.data.email } });
      if (existing) {
        const updated = await tx.corporate.update({
          where: { id: existing.id },
          data: row.data,
        });
        out.push({ email: row.data.email, action: 'updated', id: updated.id });
      } else {
        const created = await tx.corporate.create({ data: row.data });
        out.push({ email: row.data.email, action: 'created', id: created.id });
      }
    }
    return out;
  });

  return summarizeImport(results);
}

function summarizeImport(results) {
  return {
    total: results.length,
    created: results.filter((r) => r.action === 'created').length,
    updated: results.filter((r) => r.action === 'updated').length,
    results,
  };
}

export async function listBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      event: true,
      artist: { select: { id: true, name: true, email: true, artForm: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings.map((b) => ({
    id: b.id,
    event_id: b.eventId,
    artist_id: b.artistId,
    guest_email: b.guestEmail,
    guest_name: b.guestName,
    organization: b.organization,
    booking_type: b.bookingType,
    status: b.status,
    gross_amount: b.grossAmount,
    event: b.event
      ? {
          id: b.event.id,
          title: b.event.title,
          art_form: b.event.artForm,
          date: b.event.date,
          location: b.event.location,
        }
      : null,
    artist: b.artist
      ? {
          id: b.artist.id,
          name: b.artist.name,
          email: b.artist.email,
          art_form: b.artist.artForm,
        }
      : null,
    created_at: b.createdAt,
  }));
}

export async function assignArtistToEvent(eventId, artistId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);

  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError('Artist not found', 404);
  if (artist.status !== 'active') throw new AppError('Artist is inactive', 400);

  const booking = await prisma.booking.findFirst({
    where: { eventId },
    orderBy: { createdAt: 'desc' },
  });

  if (!booking) {
    throw new AppError('No booking found for this event to assign', 404);
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { artistId, status: 'confirmed' },
  });

  // Ensure a pending payout row exists for this assignment.
  const existingPayout = await prisma.payout.findFirst({
    where: { artistId, eventId },
  });
  if (!existingPayout) {
    await prisma.payout.create({
      data: {
        artistId,
        eventId,
        bookingId: updated.id,
        grossAmount: updated.grossAmount,
        artistShare: updated.grossAmount * config.artistShareRate,
        status: 'pending',
      },
    });
  }

  return {
    booking_id: updated.id,
    event_id: eventId,
    artist_id: artistId,
    status: updated.status,
  };
}

export async function listPayouts() {
  const payouts = await prisma.payout.findMany({
    include: {
      artist: { select: { id: true, name: true, email: true } },
      event: { select: { id: true, title: true, date: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return payouts.map(formatPayout);
}

export async function markPayoutPaid(artistId) {
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError('Artist not found', 404);

  const pending = await prisma.payout.findMany({
    where: { artistId, status: 'pending' },
  });
  if (!pending.length) {
    throw new AppError('No pending payouts for this artist', 404);
  }

  const updated = await prisma.payout.updateMany({
    where: { artistId, status: 'pending' },
    data: { status: 'paid', paidAt: new Date() },
  });

  return {
    artist_id: artistId,
    marked_paid: updated.count,
  };
}

export async function getArtistPayouts(artistId) {
  const payouts = await prisma.payout.findMany({
    where: { artistId },
    include: { event: { select: { id: true, title: true, date: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return payouts.map(formatPayout);
}

function formatPayout(p) {
  return {
    id: p.id,
    artist_id: p.artistId,
    event_id: p.eventId,
    booking_id: p.bookingId,
    gross_amount: p.grossAmount,
    artist_share: p.artistShare,
    share_rate: config.artistShareRate,
    status: p.status,
    paid_at: p.paidAt,
    event: p.event
      ? { id: p.event.id, title: p.event.title, date: p.event.date }
      : undefined,
    artist: p.artist
      ? { id: p.artist.id, name: p.artist.name, email: p.artist.email }
      : undefined,
    created_at: p.createdAt,
  };
}
