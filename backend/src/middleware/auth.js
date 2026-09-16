import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/helpers.js';
import { config } from '../config/index.js';
import { prisma } from '../config/db.js';

function extractBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7);
}

export function requireAuth(roles = []) {
  return async (req, _res, next) => {
    try {
      const token = extractBearer(req);
      if (!token) throw new AppError('Authentication required', 401);

      let payload;
      try {
        payload = verifyToken(token);
      } catch {
        throw new AppError('Invalid or expired token', 401);
      }

      if (roles.length && !roles.includes(payload.role)) {
        throw new AppError('Forbidden', 403);
      }

      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireArtist(req, res, next) {
  return requireAuth(['artist'])(req, res, async (err) => {
    if (err) return next(err);
    try {
      const artist = await prisma.artist.findUnique({ where: { id: req.user.sub } });
      if (!artist) throw new AppError('Artist not found', 404);
      if (artist.status !== 'active') throw new AppError('Artist account is inactive', 403);
      req.artist = artist;
      next();
    } catch (e) {
      next(e);
    }
  });
}

export function requireAdmin(req, res, next) {
  return requireAuth(['admin'])(req, res, async (err) => {
    if (err) return next(err);
    try {
      const admin = await prisma.admin.findUnique({ where: { id: req.user.sub } });
      if (!admin) throw new AppError('Admin not found', 404);
      req.admin = admin;
      next();
    } catch (e) {
      next(e);
    }
  });
}

export function requireInternal(req, _res, next) {
  const key = req.headers['x-internal-api-key'];
  if (!key || key !== config.internalApiKey) {
    return next(new AppError('Invalid internal API key', 401));
  }
  next();
}
