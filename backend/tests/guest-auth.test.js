import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/config/db.js';

const app = createApp();

describe('Guest OTP auth', () => {
  test('request + verify issues guest JWT; OTP is single-use', async () => {
    const reqRes = await request(app)
      .post('/api/auth/guest/otp/request')
      .send({ email: 'guest@example.com', name: 'Guest' });

    expect(reqRes.status).toBe(200);
    expect(reqRes.body.dev_otp).toBeTruthy();

    const verify = await request(app)
      .post('/api/auth/guest/otp/verify')
      .send({ email: 'guest@example.com', otp: reqRes.body.dev_otp });

    expect(verify.status).toBe(200);
    expect(verify.body.token).toBeTruthy();
    expect(verify.body.guest.email).toBe('guest@example.com');

    const reuse = await request(app)
      .post('/api/auth/guest/otp/verify')
      .send({ email: 'guest@example.com', otp: reqRes.body.dev_otp });
    expect(reuse.status).toBe(400);

    const logout = await request(app).post('/api/auth/logout');
    expect(logout.status).toBe(200);
  });
});
