/**
 * payments.test.js — Unit tests for payment tools.
 *
 * ⚠️ MOCKED: These tests mock apiGet/apiPost. Shapes match backend/tests/payments.test.js.
 */

import { jest } from '@jest/globals';

jest.unstable_mockModule('../src/api-client.js', () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
}));

jest.unstable_mockModule('../src/session-store.js', () => ({
  sessionStore: {
    getToken: jest.fn(() => null),
  },
  DEFAULT_CONVERSATION_ID: 'conv_default',
}));

const { apiGet, apiPost } = await import('../src/api-client.js');
const { paymentTools, handlePaymentToolCall } = await import('../src/tools/payments.js');

const SAMPLE_PAYMENT = {
  id: 'pay_1',
  booking_id: 'bk_1',
  amount: 400,
  currency: 'INR',
  headcount: 2,
  rate_per_head: 200,
  status: 'pending',
  gateway_payment_id: null,
  gateway_order_id: 'order_bk_1_1',
  split_recorded: false,
  confirmed_at: null,
  created_at: '2026-09-16T00:00:00.000Z',
};

describe('paymentTools', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('registers create_payment and get_payment_status', () => {
    expect(paymentTools.map((t) => t.name)).toEqual([
      'create_payment',
      'get_payment_status',
    ]);
  });

  test('create_payment posts Person A body and returns { payment }', async () => {
    apiPost.mockResolvedValueOnce({ payment: SAMPLE_PAYMENT });

    const result = await handlePaymentToolCall('create_payment', {
      booking_id: 'bk_1',
      idempotency_key: 'idem-pay-1',
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/payments/create',
      { booking_id: 'bk_1', idempotency_key: 'idem-pay-1' },
      {},
    );
    expect(result.isError).toBeUndefined();
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.payment.amount).toBe(400);
    expect(parsed.payment.status).toBe('pending');
  });

  test('create_payment generates chatbot-{booking_id} idempotency key when omitted', async () => {
    apiPost.mockResolvedValueOnce({ payment: SAMPLE_PAYMENT });

    await handlePaymentToolCall('create_payment', { booking_id: 'bk_1' });

    expect(apiPost).toHaveBeenCalledWith(
      '/payments/create',
      { booking_id: 'bk_1', idempotency_key: 'chatbot-bk_1' },
      {},
    );
  });

  test('create_payment maps 409 to PAYMENT_NOT_ALLOWED not SLOT_UNAVAILABLE', async () => {
    apiPost.mockRejectedValueOnce({
      error: 'Cannot create payment for status=confirmed',
      status: 409,
    });

    const result = await handlePaymentToolCall('create_payment', { booking_id: 'bk_1' });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('PAYMENT_NOT_ALLOWED');
    expect(parsed.status).toBe(409);
  });

  test('create_payment rejects missing booking_id before the API', async () => {
    const result = await handlePaymentToolCall('create_payment', {});
    expect(result.isError).toBe(true);
    expect(apiPost).not.toHaveBeenCalled();
    expect(JSON.parse(result.content[0].text).code).toBe('VALIDATION_ERROR');
  });

  test('get_payment_status GETs /payments/:id/status', async () => {
    apiGet.mockResolvedValueOnce({
      payment: { ...SAMPLE_PAYMENT, status: 'succeeded' },
    });

    const result = await handlePaymentToolCall('get_payment_status', { payment_id: 'pay_1' });
    expect(apiGet).toHaveBeenCalledWith('/payments/pay_1/status', {});
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.payment.status).toBe('succeeded');
  });

  test('get_payment_status maps 404 to PAYMENT_NOT_FOUND', async () => {
    apiGet.mockRejectedValueOnce({ error: 'Payment not found', status: 404 });
    const result = await handlePaymentToolCall('get_payment_status', { payment_id: 'missing' });
    expect(result.isError).toBe(true);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.code).toBe('PAYMENT_NOT_FOUND');
  });

  test('returns null for unknown tools', async () => {
    expect(await handlePaymentToolCall('unknown', {})).toBeNull();
  });
});
