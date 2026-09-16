/**
 * booking.js — MCP tool definition for individual booking creation.
 *
 * Wraps: POST /api/bookings/individual
 *
 * ⚠️  SCHEMA SOURCE: Verified from feature/person-a-guest-auth branch on 2026-09-16.
 *     If Person A's schemas change before merge to main, re-verify these fields.
 *
 *     individualBookingSchema (Zod):
 *       artist_id:   string (required)
 *       slot_id:     string (required) — NOT "timeslot_id"
 *       guest_email: string, email (required) — auto-injected from session store
 *       guest_name:  string, max 200 (optional)
 *       headcount:   int, 1–50, default 1
 *
 *     NO "date" field — backend infers date from the slot_id.
 *     The LLM should call get_artist_timeslots first to know the date/time
 *     of each slot and confirm with the user before calling this tool.
 *
 *     AUTH NOTE: As of 2026-09-16, the booking route has NO auth middleware.
 *     Guest is identified by guest_email in the body, not by JWT. We send both:
 *       - guest_email from session store (required by the schema)
 *       - Authorization: Bearer <token> as header (forward-compatible)
 *     This is intentionally redundant but harmless.
 */

import { apiPost } from '../api-client.js';
import { sessionStore, DEFAULT_CONVERSATION_ID } from '../session-store.js';

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
 * Executes the booking tool call and returns the formatted result for MCP.
 * @param {string} name
 * @param {Object} args
 * @returns {Promise<{ content: { type: string, text: string }[], isError?: boolean } | null>}
 */
export async function handleBookingToolCall(name, args) {
  if (name !== 'create_individual_booking') return null;

  // Check session — guest must be authenticated
  if (!sessionStore.hasSession(DEFAULT_CONVERSATION_ID)) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'Guest is not authenticated. Please call request_otp and verify_otp first.',
          requires_auth: true,
        }, null, 2),
      }],
      isError: true,
    };
  }

  const token = sessionStore.getToken(DEFAULT_CONVERSATION_ID);
  const guestEmail = sessionStore.getEmail(DEFAULT_CONVERSATION_ID);

  try {
    // Build payload matching individualBookingSchema
    const body = {
      artist_id: args.artist_id,
      slot_id: args.slot_id,
      guest_email: guestEmail,  // Injected from session store, not from LLM
    };

    if (args.guest_name) {
      body.guest_name = args.guest_name;
    }

    if (args.headcount) {
      body.headcount = args.headcount;
    }

    // POST /api/bookings/individual
    // Send both guest_email in body (required by schema) and token as header (forward compat)
    const result = await apiPost('/bookings/individual', body, {
      authToken: token,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
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
