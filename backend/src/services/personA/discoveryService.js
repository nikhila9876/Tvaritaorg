import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/helpers.js';

export async function listStates() {
  const states = await prisma.state.findMany({ orderBy: { name: 'asc' } });
  return states.map((s) => ({
    id: s.id,
    name: s.name,
    code: s.code,
  }));
}

export async function listEventsByState(stateId) {
  const state = await prisma.state.findUnique({ where: { id: stateId } });
  if (!state) throw new AppError('State not found', 404);

  const events = await prisma.event.findMany({
    where: { stateId },
    orderBy: { date: 'asc' },
  });

  return {
    state: { id: state.id, name: state.name, code: state.code },
    events: events.map(formatEvent),
  };
}

export async function getEventById(eventId) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { state: true },
  });
  if (!event) throw new AppError('Event not found', 404);
  return formatEvent(event);
}

/**
 * Artists linked to an event via bookings, with live rating from Artist (Person B writes).
 */
export async function getEventArtists(eventId) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new AppError('Event not found', 404);

  const bookings = await prisma.booking.findMany({
    where: {
      eventId,
      artistId: { not: null },
      status: { in: ['hold', 'awaiting_payment', 'pending', 'confirmed', 'completed'] },
    },
    include: {
      artist: true,
    },
  });

  const byId = new Map();
  for (const b of bookings) {
    if (!b.artist) continue;
    byId.set(b.artist.id, {
      id: b.artist.id,
      name: b.artist.name,
      art_form: b.artist.artForm,
      region: b.artist.region,
      bio: b.artist.bio,
      rating_avg: b.artist.ratingAvg,
      rating_count: b.artist.ratingCount,
      status: b.artist.status,
    });
  }

  return { event_id: eventId, artists: [...byId.values()] };
}

function formatEvent(e) {
  return {
    id: e.id,
    title: e.title,
    art_form: e.artForm,
    date: e.date,
    start_time: e.startTime,
    end_time: e.endTime,
    location: e.location,
    state_id: e.stateId,
    state: e.state
      ? { id: e.state.id, name: e.state.name, code: e.state.code }
      : undefined,
  };
}
