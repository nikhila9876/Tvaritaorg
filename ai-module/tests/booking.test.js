/**
 * booking.test.js — Unit tests for individual booking tool.
 *
 * ⚠️ MOCKED: These tests mock apiPost and sessionStore behavior.
 */

import { jest } from '@jest/globals';

// Mock api-client and session-store
jest.unstable_mockModule('../src/api-client.js', () => ({
  apiPost: jest.fn(),
}));

jest.unstable_mockModule('../src/session-store.js', () => {
  const store = {
    _sessions: new Map(),
    setSession: jest.fn((id, token, email) => store._sessions.set(id, { token, email })),
    getToken: jest.fn((id) => store._sessions.get(id)?.token),
    getEmail: jest.fn((id) => store._sessions.get(id)?.email),
    hasSession: jest.fn((id) => store._sessions.has(id)),
    clearSession: jest.fn((id) => store._sessions.delete(id)),
  };
  return {
    sessionStore: store,
    DEFAULT_CONVERSATION_ID: 'conv_default',
  };
});

const { apiPost } = await import('../src/api-client.js');
const { sessionStore, DEFAULT_CONVERSATION_ID } = await import('../src/session-store.js');
const { bookingTools, handleBookingToolCall } = await import('../src/tools/booking.js');

describe('bookingTools', () => {
  afterEach(() => {
    jest.clearAllMocks();
    sessionStore.clearSession(DEFAULT_CONVERSATION_ID);
  });

  test('registers individual, school, and corporate booking tools', () => {
    expect(bookingTools.map((t) => t.name)).toEqual([
      'create_individual_booking',
      'create_school_booking',
      'create_corporate_booking',
    ]);
  });

  test('create_individual_booking fails if guest is not authenticated', async () => {
    // Session store is empty initially
    expect(sessionStore.hasSession(DEFAULT_CONVERSATION_ID)).toBe(false);

    const result = await handleBookingToolCall('create_individual_booking', {
      artist_id: 'art_123',
      slot_id: 'slot_456',
    });

    expect(apiPost).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);

    const errContent = JSON.parse(result.content[0].text);
    expect(errContent.error).toContain('not authenticated');
    expect(errContent.requires_auth).toBe(true);
    expect(errContent.code).toBe('NOT_AUTHENTICATED');
  });

  test('create_individual_booking sends correct payload when authenticated', async () => {
    // Setup mock session
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'mock-jwt-token', 'guest@example.com');

    apiPost.mockResolvedValueOnce({
      booking: { id: 'bk_1', status: 'hold' },
    });

    const result = await handleBookingToolCall('create_individual_booking', {
      artist_id: 'art_123',
      slot_id: 'slot_456',
      headcount: 2,
    });

    // Verify it sent guest_email from session and token in headers
    expect(apiPost).toHaveBeenCalledWith('/bookings/individual', {
      artist_id: 'art_123',
      slot_id: 'slot_456',
      guest_email: 'guest@example.com',
      headcount: 2,
    }, {
      authToken: 'mock-jwt-token',
    });

    expect(result.isError).toBeUndefined();
    
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.booking.id).toBe('bk_1');
  });

  test('create_individual_booking formats API errors correctly', async () => {
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'mock-jwt', 'test@test.com');

    apiPost.mockRejectedValueOnce({
      error: 'Slot is already locked or unavailable',
      status: 409,
    });

    const result = await handleBookingToolCall('create_individual_booking', {
      artist_id: 'art_1',
      slot_id: 'slot_1',
    });

    expect(result.isError).toBe(true);
    
    const errContent = JSON.parse(result.content[0].text);
    expect(errContent.error).toBe('Slot is already locked or unavailable');
    expect(errContent.status).toBe(409);
    expect(errContent.code).toBe('SLOT_UNAVAILABLE');
  });

  test('returns null for unknown tools', async () => {
    const result = await handleBookingToolCall('unknown', {});
    expect(result).toBeNull();
  });

  test('rejects headcount of 0 or negative before hitting the API', async () => {
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'mock-jwt', 'guest@example.com');

    for (const headcount of [0, -1, 99, 1.5]) {
      const result = await handleBookingToolCall('create_individual_booking', {
        artist_id: 'art_1',
        slot_id: 'slot_1',
        headcount,
      });
      expect(result.isError).toBe(true);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.details.some((d) => d.field === 'headcount')).toBe(true);
    }

    expect(apiPost).not.toHaveBeenCalled();
  });

  test('rejects missing artist_id / slot_id before hitting the API', async () => {
    const result = await handleBookingToolCall('create_individual_booking', {
      headcount: 2,
    });
    expect(result.isError).toBe(true);
    expect(apiPost).not.toHaveBeenCalled();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('VALIDATION_ERROR');
  });

  test('create_school_booking sends Person A school body without requiring OTP', async () => {
    apiPost.mockResolvedValueOnce({
      booking: {
        id: 'bk_school',
        status: 'no_artist_available_pending_admin',
        event_id: null,
        gross_amount: 2000,
      },
    });

    const result = await handleBookingToolCall('create_school_booking', {
      school_email: 'school@example.com',
      art_form: 'Gond',
      date: '2026-12-01',
      headcount: 40,
      location: 'Auditorium',
    });

    expect(apiPost).toHaveBeenCalledWith('/bookings/school', {
      school_email: 'school@example.com',
      art_form: 'Gond',
      date: '2026-12-01',
      headcount: 40,
      location: 'Auditorium',
    }, {});
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.booking.status).toBe('no_artist_available_pending_admin');
    expect(parsed.booking.gross_amount).toBe(2000);
  });

  test('create_school_booking maps 404 to SCHOOL_NOT_FOUND', async () => {
    apiPost.mockRejectedValueOnce({
      error: 'School not found — upload via admin CSV first',
      status: 404,
    });

    const result = await handleBookingToolCall('create_school_booking', {
      school_email: 'missing@example.com',
      art_form: 'Gond',
      date: '2026-12-01',
      headcount: 10,
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('SCHOOL_NOT_FOUND');
    expect(parsed.status).toBe(404);
  });

  test('create_school_booking rejects invalid date/email/headcount before the API', async () => {
    const result = await handleBookingToolCall('create_school_booking', {
      school_email: 'not-an-email',
      art_form: 'Gond',
      date: '12/01/2026',
      headcount: 0,
    });
    expect(result.isError).toBe(true);
    expect(apiPost).not.toHaveBeenCalled();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('VALIDATION_ERROR');
    expect(parsed.details.map((d) => d.field).sort()).toEqual([
      'date',
      'headcount',
      'school_email',
    ]);
  });

  test('create_corporate_booking sends Person A corporate body without requiring OTP', async () => {
    apiPost.mockResolvedValueOnce({
      booking: {
        id: 'bk_corp',
        status: 'awaiting_payment',
        artist_id: 'art_top',
        gross_amount: 5000,
      },
    });

    const result = await handleBookingToolCall('create_corporate_booking', {
      corporate_email: 'corp1@example.com',
      art_form: 'Madhubani',
      date: '2026-11-01',
      headcount: 10,
    });

    expect(apiPost).toHaveBeenCalledWith('/bookings/corporate', {
      corporate_email: 'corp1@example.com',
      art_form: 'Madhubani',
      date: '2026-11-01',
      headcount: 10,
    }, {});
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.booking.status).toBe('awaiting_payment');
    expect(parsed.booking.gross_amount).toBe(5000);
  });

  test('create_corporate_booking maps 404 to CORPORATE_NOT_FOUND', async () => {
    apiPost.mockRejectedValueOnce({
      error: 'Corporate not found — upload via admin CSV first',
      status: 404,
    });

    const result = await handleBookingToolCall('create_corporate_booking', {
      corporate_email: 'missing@example.com',
      art_form: 'Madhubani',
      date: '2026-11-01',
      headcount: 10,
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('CORPORATE_NOT_FOUND');
    expect(parsed.status).toBe(404);
  });
});
