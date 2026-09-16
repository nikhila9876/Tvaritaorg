/**
 * feedback.test.js — Unit tests for feedback tools.
 *
 * ⚠️ MOCKED. Shapes match backend/tests/feedback.test.js.
 */

import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/api-client.js', () => ({
  apiGet: jest.fn(),
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

const { apiGet, apiPost } = await import('../src/api-client.js');
const { sessionStore, DEFAULT_CONVERSATION_ID } = await import('../src/session-store.js');
const { feedbackTools, handleFeedbackToolCall } = await import('../src/tools/feedback.js');

describe('feedbackTools', () => {
  afterEach(() => {
    jest.clearAllMocks();
    sessionStore.clearSession(DEFAULT_CONVERSATION_ID);
  });

  test('registers submit_feedback and get_artist_feedback', () => {
    expect(feedbackTools.map((t) => t.name)).toEqual([
      'submit_feedback',
      'get_artist_feedback',
    ]);
  });

  test('submit_feedback requires OTP session and injects guest_email', async () => {
    const result = await handleFeedbackToolCall('submit_feedback', {
      artist_id: 'art_1',
      event_id: 'evt_1',
      rating: 5,
    });
    expect(apiPost).not.toHaveBeenCalled();
    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0].text).code).toBe('NOT_AUTHENTICATED');
  });

  test('submit_feedback posts Person A/B body and returns pending feedback', async () => {
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'jwt', 'guest@example.com');
    apiPost.mockResolvedValueOnce({
      feedback: {
        id: 'fb_1',
        artist_id: 'art_1',
        event_id: 'evt_1',
        guest_email: 'guest@example.com',
        rating: 5,
        comment: 'Wonderful',
        status: 'pending',
      },
    });

    const result = await handleFeedbackToolCall('submit_feedback', {
      artist_id: 'art_1',
      event_id: 'evt_1',
      rating: 5,
      comment: 'Wonderful',
      guest_name: 'Guest',
    });

    expect(apiPost).toHaveBeenCalledWith('/feedback', {
      artist_id: 'art_1',
      event_id: 'evt_1',
      guest_email: 'guest@example.com',
      rating: 5,
      comment: 'Wonderful',
      guest_name: 'Guest',
    }, { authToken: 'jwt' });
    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0].text).feedback.status).toBe('pending');
  });

  test('submit_feedback maps 409 to FEEDBACK_DUPLICATE not SLOT_UNAVAILABLE', async () => {
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'jwt', 'guest@example.com');
    apiPost.mockRejectedValueOnce({
      error: 'Feedback already submitted for this guest_email and event_id',
      status: 409,
    });

    const result = await handleFeedbackToolCall('submit_feedback', {
      artist_id: 'art_1',
      event_id: 'evt_1',
      rating: 5,
    });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('FEEDBACK_DUPLICATE');
    expect(parsed.status).toBe(409);
  });

  test('submit_feedback rejects rating outside 1–5 before the API', async () => {
    sessionStore.setSession(DEFAULT_CONVERSATION_ID, 'jwt', 'guest@example.com');
    const result = await handleFeedbackToolCall('submit_feedback', {
      artist_id: 'art_1',
      event_id: 'evt_1',
      rating: 0,
    });
    expect(apiPost).not.toHaveBeenCalled();
    expect(JSON.parse(result.content[0].text).code).toBe('VALIDATION_ERROR');
  });

  test('get_artist_feedback lists approved items only (backend-filtered)', async () => {
    apiGet.mockResolvedValueOnce({
      feedback: [{ id: 'fb_old', rating: 4, status: 'approved' }],
    });
    const result = await handleFeedbackToolCall('get_artist_feedback', { artist_id: 'art_1' });
    expect(apiGet).toHaveBeenCalledWith('/artists/art_1/feedback');
    expect(JSON.parse(result.content[0].text).feedback).toHaveLength(1);
  });

  test('returns null for unknown tools', async () => {
    expect(await handleFeedbackToolCall('unknown', {})).toBeNull();
  });
});
