/**
 * feedback.js — MCP tools for Person B public feedback (confirmed path by Person A).
 *
 * AUTH (see AUTH_REQUIREMENTS.md):
 *   submit_feedback      REQUIRES_SESSION (AI policy: inject guest_email)
 *   get_artist_feedback  ANONYMOUS
 * Backend POST /api/feedback has validateBody only — no requireGuest.
 *
 * ⚠️  SCHEMA SOURCE: Inspected backend 2026-09-16 (feedbackCreateSchema +
 *     backend/tests/feedback.test.js). Same on origin/feature/person-a-guest-auth.
 *
 *     POST /api/feedback
 *       Body: { artist_id, event_id, guest_email, guest_name?, rating (1–5), comment? }
 *       201 { feedback: { id, artist_id, event_id, guest_email, guest_name,
 *                         rating, comment, status, created_at, reviewed_at } }
 *       status starts as "pending" (not live until approved)
 *       409 Feedback already submitted for this guest_email and event_id
 *       404 Artist not found
 *
 *     GET /api/artists/:artist_id/feedback
 *       200 { feedback: [approved items only] }
 *       404 Artist not found
 *
 *     No auth middleware. We still inject guest_email from the OTP session
 *     (same as individual booking) so the LLM cannot spoof another guest.
 */

import { apiGet, apiPost } from '../api-client.js';
import { sessionStore, DEFAULT_CONVERSATION_ID } from '../session-store.js';
import { mcpOk, mcpError, mcpFromCaught } from '../mcp-result.js';

export const feedbackTools = [
  {
    name: 'submit_feedback',
    description:
      'Submit a guest rating (1–5) and optional comment for an artist at an event. ' +
      'The guest must be authenticated (request_otp then verify_otp); guest_email is ' +
      'taken from the session. Feedback starts as pending and is not public until approved. ' +
      '409 means this guest already submitted for that event_id.',
    inputSchema: {
      type: 'object',
      properties: {
        artist_id: { type: 'string', description: 'The artist to rate.' },
        event_id: { type: 'string', description: 'The event the guest attended.' },
        rating: {
          type: 'number',
          description: 'Integer 1–5.',
        },
        comment: {
          type: 'string',
          description: 'Optional comment (max 2000 characters).',
        },
        guest_name: {
          type: 'string',
          description: 'Optional guest name (max 200 characters).',
        },
      },
      required: ['artist_id', 'event_id', 'rating'],
    },
  },
  {
    name: 'get_artist_feedback',
    description:
      'List approved public feedback for an artist. Pending/rejected items are omitted. ' +
      '404 means unknown artist_id.',
    inputSchema: {
      type: 'object',
      properties: {
        artist_id: { type: 'string', description: 'The artist id.' },
      },
      required: ['artist_id'],
    },
  },
];

function requireGuestSession() {
  if (!sessionStore.hasSession(DEFAULT_CONVERSATION_ID)) {
    return mcpError(
      'Guest is not authenticated. Please call request_otp and verify_otp first, then retry submit_feedback.',
      { code: 'NOT_AUTHENTICATED', requires_auth: true },
    );
  }
  const token = sessionStore.getToken(DEFAULT_CONVERSATION_ID);
  const guestEmail = sessionStore.getEmail(DEFAULT_CONVERSATION_ID);
  if (!token || !guestEmail) {
    return mcpError(
      'Guest is not authenticated. Please call request_otp and verify_otp first, then retry submit_feedback.',
      { code: 'NOT_AUTHENTICATED', requires_auth: true },
    );
  }
  return { token, guestEmail };
}

export function validateSubmitFeedbackArgs(args = {}) {
  const details = [];
  if (!args.artist_id || typeof args.artist_id !== 'string' || !args.artist_id.trim()) {
    details.push({ field: 'artist_id', message: 'artist_id is required' });
  }
  if (!args.event_id || typeof args.event_id !== 'string' || !args.event_id.trim()) {
    details.push({ field: 'event_id', message: 'event_id is required' });
  }
  const rating = Number(args.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    details.push({
      field: 'rating',
      message: 'rating must be an integer between 1 and 5 (got ' + String(args.rating) + ')',
    });
  }
  if (args.comment != null && typeof args.comment === 'string' && args.comment.length > 2000) {
    details.push({ field: 'comment', message: 'comment must be at most 2000 characters' });
  }
  if (args.guest_name != null && typeof args.guest_name === 'string' && args.guest_name.length > 200) {
    details.push({ field: 'guest_name', message: 'guest_name must be at most 200 characters' });
  }
  if (details.length === 0) return null;
  return mcpError(
    'Feedback arguments are invalid. Fix the fields below before retrying submit_feedback.',
    { code: 'VALIDATION_ERROR', details },
  );
}

export async function handleFeedbackToolCall(name, args) {
  if (name === 'submit_feedback') return handleSubmitFeedback(args);
  if (name === 'get_artist_feedback') return handleGetArtistFeedback(args);
  return null;
}

async function handleSubmitFeedback(args) {
  const validationError = validateSubmitFeedbackArgs(args);
  if (validationError) return validationError;

  const session = requireGuestSession();
  if (session.isError) return session;

  const body = {
    artist_id: args.artist_id.trim(),
    event_id: args.event_id.trim(),
    guest_email: session.guestEmail,
    rating: Number(args.rating),
  };
  if (args.guest_name) body.guest_name = args.guest_name;
  if (args.comment) body.comment = args.comment;

  try {
    const result = await apiPost('/feedback', body, { authToken: session.token });
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    const parsed = JSON.parse(caught.content[0].text);
    if (error?.status === 404) {
      return mcpError(parsed.error || 'Artist not found', {
        ...parsed,
        code: 'ARTIST_NOT_FOUND',
      });
    }
    if (error?.status === 409) {
      return mcpError(
        parsed.error || 'Feedback already submitted for this guest_email and event_id',
        {
          ...parsed,
          code: 'FEEDBACK_DUPLICATE',
          message_for_user:
            'This guest already submitted feedback for that event. Do not retry with the same event_id.',
        },
      );
    }
    return caught;
  }
}

async function handleGetArtistFeedback(args) {
  const artistId = typeof args?.artist_id === 'string' ? args.artist_id.trim() : '';
  if (!artistId) {
    return mcpError('artist_id is required.', { code: 'VALIDATION_ERROR', field: 'artist_id' });
  }

  try {
    const result = await apiGet(`/artists/${artistId}/feedback`);
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    if (error?.status === 404) {
      const parsed = JSON.parse(caught.content[0].text);
      return mcpError(parsed.error || 'Artist not found', {
        ...parsed,
        code: 'ARTIST_NOT_FOUND',
      });
    }
    return caught;
  }
}
