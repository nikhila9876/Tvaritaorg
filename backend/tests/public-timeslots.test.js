import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.js';

const app = createApp();

describe('Public artist timeslots', () => {
  test('returns only available slots without auth', async () => {
    const artist = await prisma.artist.create({
      data: {
        email: 'slots-public@example.com',
        name: 'Slot Artist',
        artForm: 'Madhubani',
        passwordHash: await hashPassword('x'),
        status: 'active',
        passwordSet: true,
      },
    });

    await prisma.timeSlot.createMany({
      data: [
        {
          artistId: artist.id,
          date: '2026-10-20',
          startTime: '10:00',
          endTime: '12:00',
          available: true,
        },
        {
          artistId: artist.id,
          date: '2026-10-20',
          startTime: '14:00',
          endTime: '16:00',
          available: false,
        },
      ],
    });

    const res = await request(app).get(`/api/artists/${artist.id}/timeslots`);
    expect(res.status).toBe(200);
    expect(res.body.timeslots).toHaveLength(1);
    expect(res.body.timeslots[0]).toMatchObject({
      date: '2026-10-20',
      start_time: '10:00',
      end_time: '12:00',
      available: true,
    });
    expect(res.body.timeslots[0].id).toBeTruthy();
  });

  test('404 when artist does not exist', async () => {
    const res = await request(app).get(
      '/api/artists/000000000000000000000000/timeslots',
    );
    expect(res.status).toBe(404);
  });
});
