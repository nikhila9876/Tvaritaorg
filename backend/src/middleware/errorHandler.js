import { ZodError } from 'zod';
import { AppError } from '../utils/helpers.js';

export function errorHandler(err, _req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      })),
    });
  }

  if (err instanceof AppError || err.status) {
    const status = err.status || 400;
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(status).json(body);
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      error: 'Conflict: unique constraint violated',
      details: { fields: err.meta?.target },
    });
  }

  if (err.code === 'P2034') {
    return res.status(409).json({
      error: 'Conflict: concurrent update — please retry',
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Uploaded file is too large' });
  }

  console.error('[unhandled]', err);
  return res.status(500).json({ error: 'Internal server error' });
}

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Not found' });
}
