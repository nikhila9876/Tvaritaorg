/**
 * booking.js — MCP tool definition for individual booking creation.
 *
 * Wraps: POST /api/bookings/individual
 *
 * ⚠️  SCHEMA SOURCE: Person A confirmed 2026-09-16 (guest-auth + public timeslots).
 *
 *     individualBookingSchema (Zod):
 *       artist_id:   string (required)
 *       slot_id:     string (required) — NOT "timeslot_id"; from get_artist_timeslots `id`
 *       guest_email: string, email (required) — auto-injected from session store
 *       guest_name:  string, max 200 (optional)
 *       headcount:   int, 1–50, default 1
 *
 *     NO "date" field — backend infers date from the slot_id.
 *     NO event_id — individual booking is artist+slot only.
 *     The LLM should call get_artist_timeslots first to know the date/time
 *     of each slot and confirm with the user before calling this tool.
 *
 *     AUTH NOTE: Booking identify-by-email; JWT is issued but unused.
 *     No requireGuest middleware planned yet. We send both:
 *       - guest_email from session store (required by the schema)
 *       - Authorization: Bearer <token> as header (forward-compatible)
 *     This is intentionally redundant but harmless.
 */

import { apiPost } from '../api-client.js';
import { sessionStore, DEFAULT_CONVERSATION_ID } from '../session-store.js';
import { mcpOk, mcpError, mcpFromCaught } from '../mcp-result.js';

export const bookingTools = [
  {
    name: 'create_individual_booking',
    description:
      'Create an individual booking for a guest with a specific artist and timeslot. ' +
      'The guest must be authenticated first (call request_otp then verify_otp). ' +
      'IMPORTANT: Before calling this, use get_artist_timeslots to show the user ' +
      'available slots with their date and time, and confirm their choice. ' +
      'The slot_id encodes the date/time — do NOT ask the user for a separate date.',
    inputSchema: {
      type: 'object',
      properties: {
        artist_id: {
          type: 'string',
          description: 'The ID of the artist to book.',
        },
        slot_id: {
          type: 'string',
          description:
            'The ID of the timeslot to book (from get_artist_timeslots). ' +
            'This determines the date and time — no separate date field needed.',
        },
        guest_name: {
          type: 'string',
          description: 'Optional: the guest\'s name for the booking.',
        },
        headcount: {
          type: 'number',
          description: 'Number of people attending (1–50, default 1).',
        },
      },
      required: ['artist_id', 'slot_id'],
    },
  },
];

/**
 * Cheap arg checks so we never hit the API with obviously bad booking payloads.
 * @returns {ReturnType<typeof mcpError> | null}
 */
export function validateBookingArgs(args = {}) {
  const details = [];

  if (!args.artist_id || typeof args.artist_id !== 'string' || !args.artist_id.trim()) {
    details.push({ field: 'artist_id', message: 'artist_id is required' });
  }
  if (!args.slot_id || typeof args.slot_id !== 'string' || !args.slot_id.trim()) {
    details.push({ field: 'slot_id', message: 'slot_id is required' });
  }

  if (args.headcount !== undefined && args.headcount !== null && args.headcount !== '') {
    const n = Number(args.headcount);
    if (!Number.isInteger(n) || n < 1 || n > 50) {
      details.push({
        field: 'headcount',
        message: 'headcount must be an integer between 1 and 50 (got ' + String(args.headcount) + ')',
      });
    }
  }

  if (args.guest_name != null && typeof args.guest_name === 'string' && args.guest_name.length > 200) {
    details.push({ field: 'guest_name', message: 'guest_name must be at most 200 characters' });
  }

  if (details.length === 0) return null;

  return mcpError(
    'Booking arguments are invalid. Fix the fields below before retrying create_individual_booking.',
    { code: 'VALIDATION_ERROR', details },
  );
}

/**
 * Executes the booking tool call and returns the formatted result for MCP.
 * @param {string} name
 * @param {Object} args
 * @returns {Promise<{ content: { type: string, text: string }[], isError?: boolean } | null>}
 */
export async function handleBookingToolCall(name, args) {
  if (name !== 'create_individual_booking') return null;

  const validationError = validateBookingArgs(args);
  if (validationError) return validationError;

  // Check session — guest must be authenticated
  if (!sessionStore.hasSession(DEFAULT_CONVERSATION_ID)) {
    return mcpError(
      'Guest is not authenticated. Please call request_otp and verify_otp first, then retry this booking.',
      { code: 'NOT_AUTHENTICATED', requires_auth: true },
    );
  }

  const token = sessionStore.getToken(DEFAULT_CONVERSATION_ID);
  const guestEmail = sessionStore.getEmail(DEFAULT_CONVERSATION_ID);

  if (!token || !guestEmail) {
    return mcpError(
      'Guest is not authenticated. Please call request_otp and verify_otp first, then retry this booking.',
      { code: 'NOT_AUTHENTICATED', requires_auth: true },
    );
  }

  try {
    const body = {
      artist_id: args.artist_id,
      slot_id: args.slot_id,
      guest_email: guestEmail,  // Injected from session store, not from LLM
    };

    if (args.guest_name) {
      body.guest_name = args.guest_name;
    }

    if (args.headcount !== undefined && args.headcount !== null && args.headcount !== '') {
      body.headcount = Number(args.headcount);
    }

    const result = await apiPost('/bookings/individual', body, {
      authToken: token,
    });

    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    if (error?.status === 409) {
      const parsed = JSON.parse(caught.content[0].text);
      return mcpError(
        parsed.error || 'That timeslot is no longer available.',
        {
          ...parsed,
          code: 'SLOT_UNAVAILABLE',
          message_for_user:
            'This timeslot was taken. Call get_artist_timeslots again and ask the guest to pick another slot.',
        },
      );
    }
    return caught;
  }
}
