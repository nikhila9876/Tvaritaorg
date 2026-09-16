/**
 * payments.js — MCP tools for Person A payment create + status.
 *
 * AUTH: create_payment and get_payment_status are ANONYMOUS, including after
 * school/corporate bookings. Backend POST /payments/create has validateBody only
 * (booking_id, no email, no requireGuest). See AUTH_REQUIREMENTS.md.
 *
 * ⚠️  SCHEMA SOURCE: Inspected backend 2026-09-16 (same on
 *     origin/feature/person-a-guest-auth). Person A confirmed the paths exist;
 *     request/response fields taken from Zod + payments.test.js, not old docs.
 *
 *     POST /api/payments/create
 *       Body: { booking_id: string, idempotency_key?: string (8–128) }
 *       201 { payment: { id, booking_id, amount, currency, headcount,
 *                        rate_per_head, status, gateway_payment_id,
 *                        gateway_order_id, split_recorded, confirmed_at,
 *                        created_at } }
 *       404 Booking not found
 *       409 Cannot create payment for status=<other>
 *
 *     GET /api/payments/:payment_id/status
 *       200 { payment: <same shape> }
 *       404 Payment not found
 *
 *     No auth middleware. JWT unused (same as bookings).
 *     Webhook is a gateway callback — not exposed as a chatbot tool.
 */

import { apiGet, apiPost } from '../api-client.js';
import { sessionStore, DEFAULT_CONVERSATION_ID } from '../session-store.js';
import { mcpOk, mcpError, mcpFromCaught } from '../mcp-result.js';

function optionalAuthOptions() {
  const token = sessionStore.getToken(DEFAULT_CONVERSATION_ID);
  return token ? { authToken: token } : {};
}

export const paymentTools = [
  {
    name: 'create_payment',
    description:
      'Start payment for an existing booking. Call after a booking is in hold or ' +
      'awaiting_payment. Body is booking_id (and optional idempotency_key). ' +
      'Returns { payment } with amount, currency, rate_per_head, status (usually pending), ' +
      'and id for get_payment_status. 409 means that booking status cannot take a payment yet. ' +
      'Do not call the webhook — that is the payment gateway, not a guest action.',
    inputSchema: {
      type: 'object',
      properties: {
        booking_id: {
          type: 'string',
          description: 'The booking id returned by a create_*_booking tool.',
        },
        idempotency_key: {
          type: 'string',
          description:
            'Optional 8–128 character key so retries return the same payment. ' +
            'If omitted, one is generated from the booking_id.',
        },
      },
      required: ['booking_id'],
    },
  },
  {
    name: 'get_payment_status',
    description:
      'Poll a payment created by create_payment. Returns { payment } with status ' +
      'created | pending | succeeded | failed. 404 means unknown payment_id.',
    inputSchema: {
      type: 'object',
      properties: {
        payment_id: {
          type: 'string',
          description: 'The payment id from create_payment (payment.id).',
        },
      },
      required: ['payment_id'],
    },
  },
];

export function validateCreatePaymentArgs(args = {}) {
  const details = [];
  if (!args.booking_id || typeof args.booking_id !== 'string' || !args.booking_id.trim()) {
    details.push({ field: 'booking_id', message: 'booking_id is required' });
  }
  if (args.idempotency_key != null && args.idempotency_key !== '') {
    const key = String(args.idempotency_key);
    if (key.length < 8 || key.length > 128) {
      details.push({
        field: 'idempotency_key',
        message: 'idempotency_key must be 8–128 characters if provided',
      });
    }
  }
  if (details.length === 0) return null;
  return mcpError(
    'Payment arguments are invalid. Fix the fields below before retrying create_payment.',
    { code: 'VALIDATION_ERROR', details },
  );
}

export async function handlePaymentToolCall(name, args) {
  if (name === 'create_payment') return handleCreatePayment(args);
  if (name === 'get_payment_status') return handleGetPaymentStatus(args);
  return null;
}

async function handleCreatePayment(args) {
  const validationError = validateCreatePaymentArgs(args);
  if (validationError) return validationError;

  const bookingId = args.booking_id.trim();
  const body = { booking_id: bookingId };
  if (args.idempotency_key) {
    body.idempotency_key = String(args.idempotency_key);
  } else {
    body.idempotency_key = `chatbot-${bookingId}`;
  }

  try {
    const result = await apiPost('/payments/create', body, optionalAuthOptions());
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    const parsed = JSON.parse(caught.content[0].text);
    if (error?.status === 404) {
      return mcpError(parsed.error || 'Booking not found', {
        ...parsed,
        code: 'BOOKING_NOT_FOUND',
      });
    }
    if (error?.status === 409) {
      return mcpError(parsed.error || 'Cannot create payment for this booking status', {
        ...parsed,
        code: 'PAYMENT_NOT_ALLOWED',
        message_for_user:
          'This booking cannot start payment yet (only hold, awaiting_payment, or pending). Call get_booking_status and explain the current status.',
      });
    }
    return caught;
  }
}

async function handleGetPaymentStatus(args) {
  const paymentId = typeof args?.payment_id === 'string' ? args.payment_id.trim() : '';
  if (!paymentId) {
    return mcpError('payment_id is required.', { code: 'VALIDATION_ERROR', field: 'payment_id' });
  }

  try {
    const result = await apiGet(`/payments/${paymentId}/status`, optionalAuthOptions());
    return mcpOk(result);
  } catch (error) {
    const caught = mcpFromCaught(error);
    if (error?.status === 404) {
      const parsed = JSON.parse(caught.content[0].text);
      return mcpError(parsed.error || 'Payment not found', {
        ...parsed,
        code: 'PAYMENT_NOT_FOUND',
      });
    }
    return caught;
  }
}
