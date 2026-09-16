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

  test('registers 1 booking tool', () => {
    expect(bookingTools.length).toBe(1);
    expect(bookingTools[0].name).toBe('create_individual_booking');
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
  });

  test('returns null for unknown tools', async () => {
    const result = await handleBookingToolCall('unknown', {});
    expect(result).toBeNull();
  });
});
