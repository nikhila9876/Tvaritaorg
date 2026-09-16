import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { requireArtist } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { timeslotsPutSchema } from '../validators/schemas.js';
import {
  getMyProfile,
  getMyBookings,
  getMyRating,
  getMyPayouts,
  getMyTimeslots,
  putMyTimeslots,
} from '../services/artistSelfService.js';

const router = Router();

router.use(requireArtist);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    res.json({ artist: await getMyProfile(req.artist) });
  }),
);

router.get(
  '/me/bookings',
  asyncHandler(async (req, res) => {
    res.json({ bookings: await getMyBookings(req.artist.id) });
  }),
);

router.get(
  '/me/rating',
  asyncHandler(async (req, res) => {
    res.json(await getMyRating(req.artist.id));
  }),
);

router.get(
  '/me/payouts',
  asyncHandler(async (req, res) => {
    res.json({ payouts: await getMyPayouts(req.artist.id) });
  }),
);

router.get(
  '/me/timeslots',
  asyncHandler(async (req, res) => {
    res.json({ timeslots: await getMyTimeslots(req.artist.id) });
  }),
);

router.put(
  '/me/timeslots',
  validateBody(timeslotsPutSchema),
  asyncHandler(async (req, res) => {
    const timeslots = await putMyTimeslots(req.artist.id, req.body.timeslots);
    res.json({ timeslots });
  }),
);

export default router;
