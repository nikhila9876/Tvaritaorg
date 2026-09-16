import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

const app = createApp();

describe('Discovery', () => {
  test('lists states, events, and event artists with live ratings', async () => {
    const state = await prisma.state.create({
      data: { name: 'Bihar', code: 'BR' },
    });
    const artist = await prisma.artist.create({
      data: {
        email: 'disc@example.com',
        name: 'Discovery Artist',
        artForm: 'Madhubani',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
        ratingAvg: 4.5,
        ratingCount: 2,
      },
    });
    const event = await prisma.event.create({
      data: {
        title: 'Folk Night',
        artForm: 'Madhubani',
        date: '2026-10-10',
        stateId: state.id,
        location: 'Patna',
      },
    });
    await prisma.booking.create({
      data: {
        eventId: event.id,
        artistId: artist.id,
        bookingType: 'individual',
        status: 'confirmed',
        guestEmail: 'g@example.com',
        date: '2026-10-10',
      },
    });

    const states = await request(app).get('/api/states');
    expect(states.status).toBe(200);
    expect(states.body.states).toHaveLength(1);

    const byState = await request(app).get(`/api/states/${state.id}/events`);
    expect(byState.status).toBe(200);
    expect(byState.body.events[0].id).toBe(event.id);

    const detail = await request(app).get(`/api/events/${event.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.event.title).toBe('Folk Night');

    const artists = await request(app).get(`/api/events/${event.id}/artists`);
    expect(artists.status).toBe(200);
    expect(artists.body.artists[0].rating_avg).toBe(4.5);
  });
});
