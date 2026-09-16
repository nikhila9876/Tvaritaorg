/**
 * api-client.test.js — Unit tests for the thin HTTP client.
 *
 * ⚠️  MOCKED: These tests use a mocked global fetch. No real backend is called.
 *     Pending real backend availability for integration testing (Step 6).
 *
 * Tests verify:
 * - Correct URL construction from BACKEND_API_URL + path
 * - JSON body serialization on POST
 * - Auth header injection when token is provided
 * - Structured error on non-2xx responses
 * - Structured error on network failure (fetch throws)
 */

import { jest } from '@jest/globals';

// Set env before importing api-client so config picks it up
const MOCK_BASE_URL = 'http://localhost:5000/api';
process.env.BACKEND_API_URL = MOCK_BASE_URL;

let mockFetch;

beforeEach(() => {
  mockFetch = jest.fn();
  global.fetch = mockFetch;
});

afterEach(() => {
  jest.restoreAllMocks();
  delete global.fetch;
});

// Dynamically import after env is set
const { apiGet, apiPost } = await import('../src/api-client.js');

describe('apiGet', () => {
  test('sends GET request to correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ states: ['Karnataka', 'Kerala'] }),
    });

    const result = await apiGet('/states');

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/states`,
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(result).toEqual({ states: ['Karnataka', 'Kerala'] });
  });

  test('injects Authorization header when authToken is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ timeslots: [] }),
    });

    await apiGet('/artists/abc123/timeslots', { authToken: 'jwt-token-xyz' });

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/artists/abc123/timeslots`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-token-xyz',
        }),
      }),
    );
  });

  test('throws structured error on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Event not found' }),
    });

    try {
      await apiGet('/events/nonexistent');
      // Should not reach here
      expect(true).toBe(false);
    } catch (err) {
      expect(err.error).toBe('Event not found');
      expect(err.status).toBe(404);
    }
  });

  test('throws structured error on network failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    try {
      await apiGet('/states');
      expect(true).toBe(false);
    } catch (err) {
      expect(err.error).toContain('Backend unreachable');
      expect(err.status).toBe(0);
    }
  });
});

describe('apiPost', () => {
  test('sends POST with JSON body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'OTP sent' }),
    });

    const result = await apiPost('/auth/guest/otp/request', {
      email: 'guest@example.com',
    });

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/auth/guest/otp/request`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'guest@example.com' }),
      }),
    );
    expect(result).toEqual({ message: 'OTP sent' });
  });

  test('sends POST with auth token for authenticated endpoints', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ booking_id: 'bk_123' }),
    });

    const result = await apiPost(
      '/bookings/individual',
      { artist_id: 'art_1', timeslot_id: 'ts_1', headcount: 4, date: '2026-10-01' },
      { authToken: 'jwt-session-token' },
    );

    expect(mockFetch).toHaveBeenCalledWith(
      `${MOCK_BASE_URL}/bookings/individual`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer jwt-session-token',
        }),
      }),
    );
    expect(result).toEqual({ booking_id: 'bk_123' });
  });

  test('throws structured error on 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ message: 'Authentication required' }),
    });

    try {
      await apiPost('/bookings/individual', { artist_id: 'art_1' });
      expect(true).toBe(false);
    } catch (err) {
      expect(err.error).toBe('Authentication required');
      expect(err.status).toBe(401);
    }
  });
});
