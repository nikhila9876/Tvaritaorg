import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { requireInternal } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import {
  availableArtistsQuerySchema,
  notificationSendSchema,
} from '../validators/schemas.js';
import { sendNotification } from '../services/notificationService.js';
import { getAvailableArtists } from '../services/artistSelfService.js';
import { releaseExpiredHolds } from '../services/personA/paymentService.js';

const router = Router();

router.use(requireInternal);

router.post(
  '/notifications/send',
  validateBody(notificationSendSchema),
  asyncHandler(async (req, res) => {
    const result = await sendNotification(req.body);
    res.status(202).json(result);
  }),
);

router.get(
  '/artists/available',
  validateQuery(availableArtistsQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await getAvailableArtists(
      req.validatedQuery.art_form,
      req.validatedQuery.date,
    );
    res.json(result);
  }),
);

router.post(
  '/jobs/release-expired-holds',
  asyncHandler(async (_req, res) => {
    res.json(await releaseExpiredHolds());
  }),
);

export default router;
