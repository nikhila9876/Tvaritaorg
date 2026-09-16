import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import guestAuthRoutes from './routes/personA/guestAuth.js';
import adminRoutes from './routes/admin.js';
import artistRoutes from './routes/artist.js';
import feedbackRoutes, { publicArtistFeedbackRouter } from './routes/feedback.js';
import internalRoutes from './routes/internal.js';
import discoveryRoutes from './routes/personA/discovery.js';
import bookingRoutes from './routes/personA/bookings.js';
import paymentRoutes from './routes/personA/payments.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'tvarita-person-a-b' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/auth', guestAuthRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/artist', artistRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/artists', publicArtistFeedbackRouter);
  app.use('/api', discoveryRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/internal', internalRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
