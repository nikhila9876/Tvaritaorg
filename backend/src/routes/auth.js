import { Router } from 'express';
import { asyncHandler } from '../utils/helpers.js';
import { validateBody } from '../middleware/validate.js';
import {
  artistLoginSchema,
  setPasswordSchema,
  adminLoginSchema,
} from '../validators/schemas.js';
import {
  loginArtist,
  loginAdmin,
  setArtistPassword,
} from '../services/artistService.js';

const router = Router();

router.post(
  '/artist/set-password',
  validateBody(setPasswordSchema),
  asyncHandler(async (req, res) => {
    const artist = await setArtistPassword(req.body.token, req.body.password);
    res.json({ message: 'Password set successfully', artist });
  }),
);

router.post(
  '/artist/login',
  validateBody(artistLoginSchema),
  asyncHandler(async (req, res) => {
    const result = await loginArtist(req.body.email, req.body.password);
    res.json(result);
  }),
);

router.post(
  '/admin/login',
  validateBody(adminLoginSchema),
  asyncHandler(async (req, res) => {
    const result = await loginAdmin(req.body.email, req.body.password);
    res.json(result);
  }),
);

export default router;
