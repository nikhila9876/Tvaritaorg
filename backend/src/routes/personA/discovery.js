import { Router } from 'express';
import { asyncHandler } from '../../utils/helpers.js';
import {
  listStates,
  listEventsByState,
  getEventById,
  getEventArtists,
} from '../../services/personA/discoveryService.js';

const router = Router();

router.get(
  '/states',
  asyncHandler(async (_req, res) => {
    res.json({ states: await listStates() });
  }),
);

router.get(
  '/states/:state_id/events',
  asyncHandler(async (req, res) => {
    res.json(await listEventsByState(req.params.state_id));
  }),
);

router.get(
  '/events/:event_id',
  asyncHandler(async (req, res) => {
    res.json({ event: await getEventById(req.params.event_id) });
  }),
);

router.get(
  '/events/:event_id/artists',
  asyncHandler(async (req, res) => {
    res.json(await getEventArtists(req.params.event_id));
  }),
);

export default router;
