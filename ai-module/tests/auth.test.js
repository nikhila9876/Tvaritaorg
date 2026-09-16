/**
 * auth.test.js — Unit tests for guest OTP auth tools.
 *
 * ⚠️ MOCKED: These tests mock apiPost from api-client and verify tool logic
 * and session store behavior without calling a real backend.
 *
 * ⚠️ SCHEMA SOURCE: Verified from feature/person-a-guest-auth branch on 2026-09-16.
 *    Fields: { email, otp } for verify (NOT otp_code), { email, name? } for request.
 */

import { jest } from '@jest/globals';

// Mock api-client before importing auth tools
jest.unstable_mockModule('../src/api-client.js', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

const { apiPost } = await import('../src/api-client.js');
const { authTools, handleAuthToolCall } = await import('../src/tools/auth.js');
const { sessionStore, DEFAULT_CONVERSATION_ID } = await import('../src/session-store.js');

describe('authTools', () => {
  afterEach(() => {
    jest.clearAllMocks();
    sessionStore.clearSession(DEFAULT_CONVERSATION_ID);
  });

  test('registers 2 auth tools', () => {
    expect(authTools.length).toBe(2);
    const names = authTools.map(t => t.name);
    expect(names).toContain('request_otp');
    expect(names).toContain('verify_otp');
  });

  test('request_otp sends correct payload to backend', async () => {
    apiPost.mockResolvedValueOnce({
      email: 'guest@example.com',
      expires_in_seconds: 300,
    });

    const result = await handleAuthToolCall('request_otp', {
      email: 'guest@example.com',
    });

    expect(apiPost).toHaveBeenCalledWith('/auth/guest/otp/request', {
      email: 'guest@example.com',
    });
    expect(result.isError).toBeUndefined();

    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.email).toBe('guest@example.com');
    expect(parsed.expires_in_seconds).toBe(300);
  });

  test('request_otp includes optional name when provided', async () => {
    apiPost.mockResolvedValueOnce({
      email: 'guest@example.com',
      expires_in_seconds: 300,
    });

    await handleAuthToolCall('request_otp', {
      email: 'guest@example.com',
      name: 'Priya',
    });

    expect(apiPost).toHaveBeenCalledWith('/auth/guest/otp/request', {
      email: 'guest@example.com',
      name: 'Priya',
    });
  });

  test('verify_otp sends email + otp (NOT otp_code) and stores session', async () => {
    apiPost.mockResolvedValueOnce({
      token: 'jwt-guest-token-abc',
      guest: {
        id: 'guest_123',
        email: 'guest@example.com',
        name: 'Priya',
      },
    });

    const result = await handleAuthToolCall('verify_otp', {
      email: 'guest@example.com',
      otp: '482910',
    });

    // Verify correct API call — field is "otp", NOT "otp_code"
    expect(apiPost).toHaveBeenCalledWith('/auth/guest/otp/verify', {
      email: 'guest@example.com',
      otp: '482910',
    });

    expect(result.isError).toBeUndefined();

    // Verify session store was populated
    expect(sessionStore.hasSession(DEFAULT_CONVERSATION_ID)).toBe(true);
    expect(sessionStore.getToken(DEFAULT_CONVERSATION_ID)).toBe('jwt-guest-token-abc');
    expect(sessionStore.getEmail(DEFAULT_CONVERSATION_ID)).toBe('guest@example.com');

    // Verify the LLM gets guest info but NOT the raw token
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.authenticated).toBe(true);
    expect(parsed.guest.id).toBe('guest_123');
    expect(parsed.token).toBeUndefined(); // Token should not be exposed to LLM
  });

  test('verify_otp returns error on invalid OTP', async () => {
    apiPost.mockRejectedValueOnce({
      error: 'Invalid OTP',
      status: 401,
    });

    const result = await handleAuthToolCall('verify_otp', {
      email: 'guest@example.com',
      otp: '000000',
    });

    expect(result.isError).toBe(true);

    const errContent = JSON.parse(result.content[0].text);
    expect(errContent.error).toBe('Invalid OTP');
    expect(errContent.status).toBe(401);
    expect(errContent.code).toBe('OTP_INVALID');
    expect(errContent.retryable).toBe(true);

    // Session store should NOT be populated on failure
    expect(sessionStore.hasSession(DEFAULT_CONVERSATION_ID)).toBe(false);
  });

  test('returns null for unknown tool names', async () => {
    const result = await handleAuthToolCall('unknown_tool', {});
    expect(result).toBeNull();
  });

  test('request_otp rejects missing/invalid email without hitting the API', async () => {
    const result = await handleAuthToolCall('request_otp', { email: 'not-an-email' });
    expect(result.isError).toBe(true);
    expect(apiPost).not.toHaveBeenCalled();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('VALIDATION_ERROR');
  });

  test('verify_otp does not claim authenticated when backend omits token', async () => {
    apiPost.mockResolvedValueOnce({
      guest: { id: 'guest_1', email: 'guest@example.com' },
    });

    const result = await handleAuthToolCall('verify_otp', {
      email: 'guest@example.com',
      otp: '482910',
    });

    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.authenticated).toBe(false);
    expect(parsed.code).toBe('AUTH_INCOMPLETE');
    expect(sessionStore.hasSession(DEFAULT_CONVERSATION_ID)).toBe(false);
  });

  test('verify_otp can be retried after a failed attempt in the same session', async () => {
    apiPost.mockRejectedValueOnce({
      error: 'Invalid OTP',
      status: 401,
    });
    apiPost.mockResolvedValueOnce({
      token: 'jwt-after-retry',
      guest: { id: 'guest_123', email: 'guest@example.com', name: 'Priya' },
    });

    const fail = await handleAuthToolCall('verify_otp', {
      email: 'guest@example.com',
      otp: '000000',
    });
    expect(fail.isError).toBe(true);
    expect(sessionStore.hasSession(DEFAULT_CONVERSATION_ID)).toBe(false);

    const ok = await handleAuthToolCall('verify_otp', {
      email: 'guest@example.com',
      otp: '482910',
    });
    expect(ok.isError).toBeUndefined();
    expect(sessionStore.getToken(DEFAULT_CONVERSATION_ID)).toBe('jwt-after-retry');
  });
});
