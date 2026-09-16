import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { validateBody } from '../middleware/validate.js';
import { feedbackCreateSchema } from '../validators/schemas.js';
import {
  createFeedback,
  listApprovedFeedbackForArtist,
} from '../services/feedbackService.js';

const router = Router();

router.post(
  '/',
  validateBody(feedbackCreateSchema),
  asyncHandler(async (req, res) => {
    const feedback = await createFeedback(req.body);
    res.status(201).json({ feedback });
  }),
);

export const publicArtistFeedbackRouter = Router();

publicArtistFeedbackRouter.get(
  '/:artist_id/feedback',
  asyncHandler(async (req, res) => {
    const feedback = await listApprovedFeedbackForArtist(req.params.artist_id);
    res.json({ feedback });
  }),
);

export default router;
