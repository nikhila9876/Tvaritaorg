import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers.js';
import { validateBody } from '../../middleware/validate.js';
import {
  guestOtpRequestSchema,
  guestOtpVerifySchema,
} from '../../validators/schemas.js';
import {
  requestGuestOtp,
  verifyGuestOtp,
  logoutGuest,
} from '../../services/personA/guestAuthService.js';

const router = Router();

router.post(
  '/guest/otp/request',
  validateBody(guestOtpRequestSchema),
  asyncHandler(async (req, res) => {
    const result = await requestGuestOtp(req.body);
    res.status(200).json(result);
  }),
);

router.post(
  '/guest/otp/verify',
  validateBody(guestOtpVerifySchema),
  asyncHandler(async (req, res) => {
    const result = await verifyGuestOtp(req.body);
    res.json(result);
  }),
);

router.post(
  '/logout',
  asyncHandler(async (_req, res) => {
    res.json(logoutGuest());
  }),
);

export default router;
