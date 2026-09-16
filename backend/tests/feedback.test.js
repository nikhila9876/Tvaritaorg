import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';
import { autoApproveStaleFeedback } from '../src/services/feedbackService.js';

const app = createApp();

async function seedArtist() {
  return prisma.artist.create({
    data: {
      email: 'folk@example.com',
      name: 'Folk Artist',
      artForm: 'Madhubani',
      passwordHash: await hashPassword('TempPass123!'),
      status: 'active',
      passwordSet: true,
    },
  });
}

async function seedEvent(title = 'Test Event') {
  return prisma.event.create({
    data: {
      title,
      artForm: 'Madhubani',
      date: '2026-10-01',
    },
  });
}

describe('Feedback rate-limit and auto-approve', () => {
  test('allows only one feedback per (guest_email, event_id)', async () => {
    const artist = await seedArtist();
    const event = await seedEvent('Rate limit event');

    const payload = {
      artist_id: artist.id,
      event_id: event.id,
      guest_email: 'guest@example.com',
      guest_name: 'Guest',
      rating: 5,
      comment: 'Wonderful',
    };

    const first = await request(app).post('/api/feedback').send(payload);
    expect(first.status).toBe(201);
    expect(first.body.feedback.status).toBe('pending');

    const second = await request(app).post('/api/feedback').send(payload);
    expect(second.status).toBe(409);

    const count = await prisma.feedback.count({
      where: { guestEmail: 'guest@example.com', eventId: event.id },
    });
    expect(count).toBe(1);
  });

  test('auto-approves feedback still pending after 72h and updates live rating', async () => {
    const artist = await seedArtist();
    const oldEvent = await seedEvent('Old event');
    const newEvent = await seedEvent('New event');

    const stale = await prisma.feedback.create({
      data: {
        artistId: artist.id,
        eventId: oldEvent.id,
        guestEmail: 'old@example.com',
        rating: 4,
        status: 'pending',
        createdAt: new Date(Date.now() - 73 * 60 * 60 * 1000),
      },
    });

    const fresh = await prisma.feedback.create({
      data: {
        artistId: artist.id,
        eventId: newEvent.id,
        guestEmail: 'new@example.com',
        rating: 2,
        status: 'pending',
        createdAt: new Date(),
      },
    });

    const result = await autoApproveStaleFeedback(72);
    expect(result.approved).toBe(1);

    const updatedStale = await prisma.feedback.findUnique({ where: { id: stale.id } });
    const updatedFresh = await prisma.feedback.findUnique({ where: { id: fresh.id } });
    expect(updatedStale.status).toBe('approved');
    expect(updatedFresh.status).toBe('pending');

    const refreshedArtist = await prisma.artist.findUnique({ where: { id: artist.id } });
    expect(refreshedArtist.ratingCount).toBe(1);
    expect(refreshedArtist.ratingAvg).toBe(4);

    const publicList = await request(app).get(`/api/artists/${artist.id}/feedback`);
    expect(publicList.status).toBe(200);
    expect(publicList.body.feedback).toHaveLength(1);
    expect(publicList.body.feedback[0].id).toBe(stale.id);
  });
});
