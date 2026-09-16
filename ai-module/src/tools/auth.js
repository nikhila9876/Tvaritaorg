/**
 * auth.js — MCP tool definitions for guest OTP authentication.
 *
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
        // POST /api/auth/guest/otp/request
        const body = { email: args.email };
        if (args.name) body.name = args.name;

        const result = await apiPost('/auth/guest/otp/request', body);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'verify_otp': {
        // POST /api/auth/guest/otp/verify
        const result = await apiPost('/auth/guest/otp/verify', {
          email: args.email,
          otp: args.otp,
        });

        // Store the session token for subsequent authenticated calls
        if (result.token) {
          sessionStore.setSession(
            DEFAULT_CONVERSATION_ID,
            result.token,
            args.email,
          );
        }

        // Return guest info to the LLM (but not the raw token — it doesn't need it)
        const safeResult = {
          authenticated: true,
          guest: result.guest,
          message: 'Guest authenticated successfully. You can now proceed with booking.',
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(safeResult, null, 2) }],
        };
      }

      default:
        return null; // Not an auth tool
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: error.error || error.message || 'Unknown error',
          status: error.status || 0,
        }, null, 2),
      }],
      isError: true,
    };
  }
}
