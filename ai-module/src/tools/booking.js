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
 *
 * School (Person A confirmed 2026-09-16 + backend Zod/tests):
 *   POST /api/bookings/school
 *   Body: school_email, art_form, date (YYYY-MM-DD), headcount (1–5000),
 *         guest_name? (max 200), location? (max 300)
 *   201 { booking } status awaiting_payment | no_artist_available_pending_admin
 *   404 if school email is not in admin CSV
 *   Rate 50/head. Identify-by-email; JWT not required.
 *
 * Corporate (Person A confirmed 2026-09-16 + backend Zod/tests):
 *   POST /api/bookings/corporate
 *   Body: corporate_email, art_form, date (YYYY-MM-DD), headcount (1–5000),
 *         guest_name? (max 200), location? (max 300)
 *   201 { booking } status awaiting_payment | no_artist_available_pending_admin
 *   404 if corporate email is not in admin CSV
 *   Rate 500/head. Highest rating_avg assigned first. JWT not required.
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
  {
    name: 'create_school_booking',
    description:
      'Create a school booking. The school must already exist (uploaded via admin CSV). ' +
      'Identify with school_email — guest OTP is not required. ' +
      'Date must be YYYY-MM-DD. Headcount 1–5000 at ₹50/head. ' +
      'Success is 201 { booking }: status awaiting_payment (artist assigned) or ' +
      'no_artist_available_pending_admin (admin will assign). ' +
      '404 means that school_email is not on file.',
    inputSchema: {
      type: 'object',
      properties: {
        school_email: {
          type: 'string',
          description: 'Registered school email (must already exist from admin CSV).',
        },
        art_form: {
          type: 'string',
          description: 'Art form to book (e.g. Madhubani, Yakshagana).',
        },
        date: {
          type: 'string',
          description: 'Event date as YYYY-MM-DD.',
        },
        headcount: {
          type: 'number',
          description: 'Number of students/attendees (1–5000). Required.',
        },
        guest_name: {
          type: 'string',
          description: 'Optional contact name for the booking.',
        },
        location: {
          type: 'string',
          description: 'Optional venue/location (max 300 characters).',
        },
      },
      required: ['school_email', 'art_form', 'date', 'headcount'],
    },
  },
  {
    name: 'create_corporate_booking',
    description:
      'Create a corporate booking. The company must already exist (uploaded via admin CSV). ' +
      'Identify with corporate_email — guest OTP is not required. ' +
      'Date must be YYYY-MM-DD. Headcount 1–5000 at ₹500/head. ' +
      'Success is 201 { booking }: status awaiting_payment (highest-rated available artist assigned) or ' +
      'no_artist_available_pending_admin (admin will assign). ' +
      '404 means that corporate_email is not on file.',
    inputSchema: {
      type: 'object',
      properties: {
        corporate_email: {
          type: 'string',
          description: 'Registered corporate email (must already exist from admin CSV).',
        },
        art_form: {
          type: 'string',
          description: 'Art form to book (e.g. Madhubani, Yakshagana).',
        },
        date: {
          type: 'string',
          description: 'Event date as YYYY-MM-DD.',
        },
        headcount: {
          type: 'number',
          description: 'Number of attendees (1–5000). Required.',
        },
        guest_name: {
          type: 'string',
          description: 'Optional contact name for the booking.',
        },
        location: {
          type: 'string',
          description: 'Optional venue/location (max 300 characters).',
        },
      },
      required: ['corporate_email', 'art_form', 'date', 'headcount'],
    },
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function optionalAuthOptions() {
  const token = sessionStore.getToken(DEFAULT_CONVERSATION_ID);
  return token ? { authToken: token } : {};
}

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
 * School booking args — Person A schoolBookingSchema.
 * @returns {ReturnType<typeof mcpError> | null}
 */
export function validateSchoolBookingArgs(args = {}) {
  const details = [];
  const email = typeof args.school_email === 'string' ? args.school_email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    details.push({ field: 'school_email', message: 'school_email must be a valid email' });
  }
  if (!args.art_form || typeof args.art_form !== 'string' || !args.art_form.trim()) {
    details.push({ field: 'art_form', message: 'art_form is required' });
  }
  if (!args.date || !DATE_RE.test(String(args.date))) {
    details.push({ field: 'date', message: 'date must be YYYY-MM-DD' });
  }
  const n = Number(args.headcount);
  if (!Number.isInteger(n) || n < 1 || n > 5000) {
    details.push({
      field: 'headcount',
      message: 'headcount must be an integer between 1 and 5000 (got ' + String(args.headcount) + ')',
    });
  }
  if (args.guest_name != null && typeof args.guest_name === 'string' && args.guest_name.length > 200) {
    details.push({ field: 'guest_name', message: 'guest_name must be at most 200 characters' });
  }
  if (args.location != null && typeof args.location === 'string' && args.location.length > 300) {
    details.push({ field: 'location', message: 'location must be at most 300 characters' });
  }
  if (details.length === 0) return null;
  return mcpError(
    'School booking arguments are invalid. Fix the fields below before retrying create_school_booking.',
    { code: 'VALIDATION_ERROR', details },
  );
}

/**
 * Corporate booking args — Person A corporateBookingSchema.
 * @returns {ReturnType<typeof mcpError> | null}
 */
export function validateCorporateBookingArgs(args = {}) {
  const details = [];
  const email = typeof args.corporate_email === 'string' ? args.corporate_email.trim() : '';
  if (!email || !EMAIL_RE.test(email)) {
    details.push({ field: 'corporate_email', message: 'corporate_email must be a valid email' });
  }
  if (!args.art_form || typeof args.art_form !== 'string' || !args.art_form.trim()) {
    details.push({ field: 'art_form', message: 'art_form is required' });
  }
  if (!args.date || !DATE_RE.test(String(args.date))) {
    details.push({ field: 'date', message: 'date must be YYYY-MM-DD' });
  }
  const n = Number(args.headcount);
  if (!Number.isInteger(n) || n < 1 || n > 5000) {
    details.push({
      field: 'headcount',
      message: 'headcount must be an integer between 1 and 5000 (got ' + String(args.headcount) + ')',
    });
  }
  if (args.guest_name != null && typeof args.guest_name === 'string' && args.guest_name.length > 200) {
    details.push({ field: 'guest_name', message: 'guest_name must be at most 200 characters' });
  }
  if (args.location != null && typeof args.location === 'string' && args.location.length > 300) {
    details.push({ field: 'location', message: 'location must be at most 300 characters' });
  }
  if (details.length === 0) return null;
  return mcpError(
    'Corporate booking arguments are invalid. Fix the fields below before retrying create_corporate_booking.',
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
  if (name === 'create_individual_booking') {
    return handleIndividualBooking(args);
  }
  if (name === 'create_school_booking') {
    return handleSchoolBooking(args);
  }
  if (name === 'create_corporate_booking') {
    return handleCorporateBooking(args);
  }
  return null;
}

async function handleIndividualBooking(args) {
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

async function handleSchoolBooking(args) {
  const validationError = validateSchoolBookingArgs(args);
  if (validationError) return validationError;

  const body = {
    school_email: args.school_email.trim(),
    art_form: args.art_form.trim(),
    date: String(args.date),
    headcount: Number(args.headcount),
  };
  if (args.guest_name) body.guest_name = args.guest_name;
  if (args.location) body.location = args.location;

  try {
    const result = await apiPost('/bookings/school', body, optionalAuthOptions());
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    const parsed = JSON.parse(caught.content[0].text);
    if (error?.status === 404) {
      return mcpError(
        parsed.error || 'School not found — upload via admin CSV first',
        {
          ...parsed,
          code: 'SCHOOL_NOT_FOUND',
          message_for_user:
            'That school_email is not registered. The school must be uploaded via admin CSV before booking.',
        },
      );
    }
    if (error?.status === 409) {
      return mcpError(
        parsed.error || 'Artist could not be assigned for this date.',
        {
          ...parsed,
          code: 'ARTIST_DATE_UNAVAILABLE',
          message_for_user:
            'No artist could be locked for that date. The booking may be pending admin assignment — tell the school and do not invent an artist.',
        },
      );
    }
    return caught;
  }
}

async function handleCorporateBooking(args) {
  const validationError = validateCorporateBookingArgs(args);
  if (validationError) return validationError;

  const body = {
    corporate_email: args.corporate_email.trim(),
    art_form: args.art_form.trim(),
    date: String(args.date),
    headcount: Number(args.headcount),
  };
  if (args.guest_name) body.guest_name = args.guest_name;
  if (args.location) body.location = args.location;

  try {
    const result = await apiPost('/bookings/corporate', body, optionalAuthOptions());
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    const parsed = JSON.parse(caught.content[0].text);
    if (error?.status === 404) {
      return mcpError(
        parsed.error || 'Corporate not found — upload via admin CSV first',
        {
          ...parsed,
          code: 'CORPORATE_NOT_FOUND',
          message_for_user:
            'That corporate_email is not registered. The company must be uploaded via admin CSV before booking.',
        },
      );
    }
    if (error?.status === 409) {
      return mcpError(
        parsed.error || 'Artist could not be assigned for this date.',
        {
          ...parsed,
          code: 'ARTIST_DATE_UNAVAILABLE',
          message_for_user:
            'No artist could be locked for that date. The booking may be pending admin assignment — tell the company and do not invent an artist.',
        },
      );
    }
    return caught;
  }
}
