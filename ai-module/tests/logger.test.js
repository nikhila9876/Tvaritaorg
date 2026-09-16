/**
 * logger.test.js — Redaction and log payload safety.
 */

import { jest } from '@jest/globals';
import { redact, logToolCall, logToolResult, logOpenRouterError } from '../src/logger.js';

describe('redact', () => {
  test('redacts email, token, otp, and authorization keys (any nesting)', () => {
    const input = {
      artist_id: 'art_1',
      email: 'guest@example.com',
      guest_email: 'guest@example.com',
      otp: '482910',
      nested: {
        token: 'jwt-secret',
        Authorization: 'Bearer abc',
        slot_id: 'slot_1',
      },
    };

    const out = redact(input);
    expect(out.artist_id).toBe('art_1');
    expect(out.email).toBe('[REDACTED]');
    expect(out.guest_email).toBe('[REDACTED]');
    expect(out.otp).toBe('[REDACTED]');
    expect(out.nested.token).toBe('[REDACTED]');
    expect(out.nested.Authorization).toBe('[REDACTED]');
    expect(out.nested.slot_id).toBe('slot_1');
  });
});

describe('log writers', () => {
  let stderr;

  beforeEach(() => {
    stderr = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    stderr.mockRestore();
  });

  test('logToolCall writes redacted args to stderr', () => {
    logToolCall('verify_otp', { email: 'a@b.com', otp: '123456' });
    expect(stderr).toHaveBeenCalledTimes(1);
    const line = stderr.mock.calls[0][0];
    expect(line).toContain('tool_call');
    expect(line).not.toContain('a@b.com');
    expect(line).not.toContain('123456');
    expect(line).toContain('[REDACTED]');
  });

  test('logToolResult and logOpenRouterError write to stderr', () => {
    logToolResult('create_individual_booking', {
      ok: false,
      status: 409,
      code: 'SLOT_UNAVAILABLE',
      error: 'Slot is already locked or unavailable',
    });
    logOpenRouterError({ status: 429, rateLimited: true, retryAfter: '20', body: 'slow down' });
    expect(stderr).toHaveBeenCalledTimes(2);
    expect(stderr.mock.calls[0][0]).toContain('tool_result');
    expect(stderr.mock.calls[1][0]).toContain('openrouter_error');
    expect(stderr.mock.calls[1][0]).toContain('429');
  });
});
