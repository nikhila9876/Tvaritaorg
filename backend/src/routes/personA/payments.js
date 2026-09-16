import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers.js';
import { validateBody } from '../../middleware/validate.js';
import {
  paymentCreateSchema,
  paymentWebhookSchema,
} from '../../validators/schemas.js';
import {
  createPayment,
  handlePaymentWebhook,
  getPaymentStatus,
} from '../../services/personA/paymentService.js';

const router = Router();

router.post(
  '/create',
  validateBody(paymentCreateSchema),
  asyncHandler(async (req, res) => {
    const payment = await createPayment({
      bookingId: req.body.booking_id,
      idempotencyKey: req.body.idempotency_key,
    });
    res.status(201).json({ payment });
  }),
);

router.post(
  '/webhook',
  validateBody(paymentWebhookSchema),
  asyncHandler(async (req, res) => {
    const result = await handlePaymentWebhook(req.body);
    res.json(result);
  }),
);

router.get(
  '/:payment_id/status',
  asyncHandler(async (req, res) => {
    res.json({ payment: await getPaymentStatus(req.params.payment_id) });
  }),
);

export default router;
