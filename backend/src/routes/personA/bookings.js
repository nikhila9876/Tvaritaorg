import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers.js';
import { validateBody } from '../../middleware/validate.js';
import {
  individualBookingSchema,
  schoolBookingSchema,
  corporateBookingSchema,
} from '../../validators/schemas.js';
import {
  createIndividualBooking,
  createSchoolBooking,
  createCorporateBooking,
  getBookingById,
  getBookingStatus,
} from '../../services/personA/bookingService.js';

const router = Router();

router.post(
  '/individual',
  validateBody(individualBookingSchema),
  asyncHandler(async (req, res) => {
    const booking = await createIndividualBooking({
      artistId: req.body.artist_id,
      slotId: req.body.slot_id,
      guestEmail: req.body.guest_email,
      guestName: req.body.guest_name,
      headcount: req.body.headcount,
    });
    res.status(201).json({ booking });
  }),
);

router.post(
  '/school',
  validateBody(schoolBookingSchema),
  asyncHandler(async (req, res) => {
    const booking = await createSchoolBooking({
      schoolEmail: req.body.school_email,
      artForm: req.body.art_form,
      date: req.body.date,
      headcount: req.body.headcount,
      guestName: req.body.guest_name,
      location: req.body.location,
    });
    res.status(201).json({ booking });
  }),
);

router.post(
  '/corporate',
  validateBody(corporateBookingSchema),
  asyncHandler(async (req, res) => {
    const booking = await createCorporateBooking({
      corporateEmail: req.body.corporate_email,
      artForm: req.body.art_form,
      date: req.body.date,
      headcount: req.body.headcount,
      guestName: req.body.guest_name,
      location: req.body.location,
    });
    res.status(201).json({ booking });
  }),
);

router.get(
  '/:booking_id/status',
  asyncHandler(async (req, res) => {
    res.json(await getBookingStatus(req.params.booking_id));
  }),
);

router.get(
  '/:booking_id',
  asyncHandler(async (req, res) => {
    res.json({ booking: await getBookingById(req.params.booking_id) });
  }),
);

export default router;
