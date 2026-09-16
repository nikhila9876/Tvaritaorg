import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { requireAdmin } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { csvUpload } from '../middleware/upload.js';
import {
  artistFieldsSchema,
  assignArtistSchema,
  feedbackStatusQuerySchema,
} from '../validators/schemas.js';
import {
  createArtistFromBody,
  importArtistsFromCsv,
} from '../services/artistService.js';
import {
  listArtists,
  getArtistById,
  deactivateArtist,
  importSchoolsFromCsv,
  importCorporatesFromCsv,
  listBookings,
  assignArtistToEvent,
  listPayouts,
  markPayoutPaid,
} from '../services/adminService.js';
import {
  listAdminFeedback,
  approveFeedback,
  rejectFeedback,
} from '../services/feedbackService.js';
import { AppError } from '../utils/helpers.js';

const router = Router();

router.use(requireAdmin);

/* ── Artists ─────────────────────────────────────────────────────── */
router.post(
  '/artists/csv-upload',
  csvUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('CSV file is required (field name: file)', 400);
    const result = await importArtistsFromCsv(req.file.buffer);
    res.status(200).json(result);
  }),
);

router.post(
  '/artists',
  validateBody(artistFieldsSchema),
  asyncHandler(async (req, res) => {
    const result = await createArtistFromBody(req.body);
    res.status(result.created ? 201 : 200).json(result);
  }),
);

router.get(
  '/artists',
  asyncHandler(async (_req, res) => {
    res.json({ artists: await listArtists() });
  }),
);

router.get(
  '/artists/:artist_id',
  asyncHandler(async (req, res) => {
    res.json({ artist: await getArtistById(req.params.artist_id) });
  }),
);

router.put(
  '/artists/:artist_id/deactivate',
  asyncHandler(async (req, res) => {
    res.json({ artist: await deactivateArtist(req.params.artist_id) });
  }),
);

/* ── Schools / Corporates CSV ────────────────────────────────────── */
router.post(
  '/schools/csv-upload',
  csvUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('CSV file is required (field name: file)', 400);
    res.json(await importSchoolsFromCsv(req.file.buffer));
  }),
);

router.post(
  '/corporates/csv-upload',
  csvUpload,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new AppError('CSV file is required (field name: file)', 400);
    res.json(await importCorporatesFromCsv(req.file.buffer));
  }),
);

/* ── Feedback moderation ─────────────────────────────────────────── */
router.get(
  '/feedback',
  validateQuery(feedbackStatusQuerySchema),
  asyncHandler(async (req, res) => {
    res.json({ feedback: await listAdminFeedback(req.validatedQuery.status) });
  }),
);

router.post(
  '/feedback/:feedback_id/approve',
  asyncHandler(async (req, res) => {
    res.json({ feedback: await approveFeedback(req.params.feedback_id) });
  }),
);

router.post(
  '/feedback/:feedback_id/reject',
  asyncHandler(async (req, res) => {
    res.json({ feedback: await rejectFeedback(req.params.feedback_id) });
  }),
);

/* ── Bookings / events / payouts ─────────────────────────────────── */
router.get(
  '/bookings',
  asyncHandler(async (_req, res) => {
    res.json({ bookings: await listBookings() });
  }),
);

router.post(
  '/events/:event_id/assign-artist',
  validateBody(assignArtistSchema),
  asyncHandler(async (req, res) => {
    const result = await assignArtistToEvent(req.params.event_id, req.body.artist_id);
    res.json(result);
  }),
);

router.get(
  '/payouts',
  asyncHandler(async (_req, res) => {
    res.json({ payouts: await listPayouts() });
  }),
);

router.post(
  '/payouts/:artist_id/mark-paid',
  asyncHandler(async (req, res) => {
    res.json(await markPayoutPaid(req.params.artist_id));
  }),
);

export default router;
