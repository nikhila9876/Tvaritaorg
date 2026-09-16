/**
 * auth.js — MCP tool definitions for guest OTP authentication.
 *
 * AUTH: request_otp and verify_otp are ANONYMOUS (they create the session).
 * See AUTH_REQUIREMENTS.md.
 * Wraps:
 *   POST /api/auth/guest/otp/request
 *   POST /api/auth/guest/otp/verify
 *
 * SESSION TOKEN DESIGN:
 * ─────────────────────
 * When verify_otp succeeds, the backend returns a JWT and guest info.
 * We store the JWT + email in the session store (session-store.js) keyed
 * by DEFAULT_CONVERSATION_ID (single-session-per-process for v1).
 *
 * All subsequent authenticated tool calls (e.g. create_individual_booking)
 * read the token from the session store transparently — the LLM never
 * needs to manage or pass tokens.
 *
 * If an authenticated tool is called and no session exists, it returns an
 * error guiding the LLM to call request_otp → verify_otp first.
 *
 * ⚠️  SCHEMA SOURCE: Verified from feature/person-a-guest-auth branch on 2026-09-16.
 *     If Person A's schemas change before merge to main, re-verify these fields.
 *
 *     request_otp input:  { email: string, name?: string }
 *     request_otp output: { email, expires_in_seconds, dev_otp? }
 *     verify_otp input:   { email: string, otp: string }  (NOT otp_code)
 *     verify_otp output:  { token: string, guest: { id, email, name } }
 */

import { apiPost } from '../api-client.js';
import { sessionStore, DEFAULT_CONVERSATION_ID } from '../session-store.js';
import { mcpOk, mcpError, mcpFromCaught } from '../mcp-result.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function invalidEmailError(email) {
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    return mcpError(
      'A valid email address is required. Ask the guest for their email and retry.',
      { code: 'VALIDATION_ERROR', field: 'email' },
    );
  }
  return null;
}

export const authTools = [
  {
    name: 'request_otp',
    description:
      'Send a one-time password (OTP) to a guest\'s email address for authentication. ' +
      'Call this before verify_otp. The guest will receive the OTP in their inbox.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'The guest\'s email address to send the OTP to.',
        },
        name: {
          type: 'string',
          description: 'Optional: the guest\'s name.',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'verify_otp',
    description:
      'Verify a guest\'s OTP code to authenticate them. Call this after request_otp, ' +
      'once the guest provides the code they received. On success, the guest is ' +
      'authenticated and can proceed to book.',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'The guest\'s email address (same as used in request_otp).',
        },
        otp: {
          type: 'string',
          description: 'The OTP code the guest received via email.',
        },
      },
      required: ['email', 'otp'],
    },
  },
];

/**
 * Executes an auth tool call and returns the formatted result for MCP.
 * @param {string} name
 * @param {Object} args
 * @returns {Promise<{ content: { type: string, text: string }[], isError?: boolean } | null>}
 */
export async function handleAuthToolCall(name, args) {
  try {
    switch (name) {
      case 'request_otp': {
        const invalid = invalidEmailError(args?.email);
        if (invalid) return invalid;

        const body = { email: args.email.trim() };
        if (args.name) body.name = args.name;

        const result = await apiPost('/auth/guest/otp/request', body);
        return mcpOk(result);
      }

      case 'verify_otp': {
        const invalid = invalidEmailError(args?.email);
        if (invalid) return invalid;

        const otp = args?.otp != null ? String(args.otp).trim() : '';
        if (!otp || otp.length < 4 || otp.length > 8) {
          return mcpError(
            'A valid OTP code is required (4–8 characters). Ask the guest to re-enter the code, or call request_otp again to send a new one.',
            { code: 'VALIDATION_ERROR', field: 'otp', retryable: true },
          );
        }

        const result = await apiPost('/auth/guest/otp/verify', {
          email: args.email.trim(),
          otp,
        });

        if (!result?.token) {
          return mcpError(
            'OTP verify succeeded but the backend did not return a session token. The guest is NOT authenticated — do not proceed to booking.',
            { code: 'AUTH_INCOMPLETE', authenticated: false },
          );
        }

        sessionStore.setSession(
          DEFAULT_CONVERSATION_ID,
          result.token,
          (result.guest?.email || args.email).trim(),
        );

        return mcpOk({
          authenticated: true,
          guest: result.guest,
          message: 'Guest authenticated successfully. You can now proceed with booking.',
        });
      }

      default:
        return null; // Not an auth tool
    }
  } catch (error) {
    const status = error?.status;
    const extra = {};
    if (status === 401 || (typeof error?.error === 'string' && /otp/i.test(error.error))) {
      extra.code = 'OTP_INVALID';
      extra.retryable = true;
      extra.message_for_user =
        'That OTP was not accepted. Ask the guest to try again with the same code, or call request_otp to send a new one. They can retry in this conversation.';
    }
    const result = mcpFromCaught(error);
    if (extra.code) {
      const parsed = JSON.parse(result.content[0].text);
      return mcpError(parsed.error, { ...parsed, ...extra });
    }
    return result;
  }
}
