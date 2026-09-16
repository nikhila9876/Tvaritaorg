import 'dotenv/config';
import {
  ARTIST_SHARE_RATE,
  BOOKING_RATES,
  GUEST_SESSION_TTL,
  OTP_TTL_MINUTES,
  PAYMENT_WINDOW_HOURS,
  SLOT_HOLD_MINUTES,
} from '../constants/pricing.js';

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  internalApiKey: process.env.INTERNAL_API_KEY || 'dev-internal-api-key',
  passwordTokenTtlHours: Number(process.env.PASSWORD_TOKEN_TTL_HOURS || 72),
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Tvarita <no-reply@tvarita.org>',
    /** "console" logs emails; "smtp" sends via nodemailer */
    emailMode: process.env.EMAIL_MODE || 'console',
  },
  artistShareRate: ARTIST_SHARE_RATE,
  bookingRates: BOOKING_RATES,
  otpTtlMinutes: OTP_TTL_MINUTES,
  guestSessionTtl: GUEST_SESSION_TTL,
  slotHoldMinutes: SLOT_HOLD_MINUTES,
  paymentWindowHours: PAYMENT_WINDOW_HOURS,
};
