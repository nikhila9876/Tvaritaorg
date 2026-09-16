import crypto from 'crypto';
import { prisma } from '../../config/db.js';
import { config } from '../../config/index.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/jwt.js';
import { AppError } from '../../utils/helpers.js';
import { sendNotification } from '../notificationService.js';
import { GUEST_SESSION_TTL, OTP_TTL_MINUTES } from '../../constants/pricing.js';

function generateOtpCode() {
  if (config.nodeEnv === 'test' || !config.brevo.apiKey) {
    return process.env.GUEST_OTP_DEV_CODE || '482910';
  }
  return String(crypto.randomInt(100000, 999999));
}

/**
 * POST /api/auth/guest/otp/request
 * Uses Person B's notification dispatch (same as POST /internal/notifications/send).
 */
export async function requestGuestOtp({ email, name }) {
  const normalized = email.toLowerCase();
  const guest = await prisma.guest.upsert({
    where: { email: normalized },
    update: name ? { name } : {},
    create: { email: normalized, name: name || null },
  });

  const code = generateOtpCode();
  const codeHash = await hashPassword(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.guestOtp.create({
    data: {
      guestId: guest.id,
      email: normalized,
      codeHash,
      expiresAt,
      usedAt: null,
    },
  });

  await sendNotification({
    channel: 'email',
    to: normalized,
    template: 'guest_otp',
    data: {
      name: guest.name || 'Guest',
      otp: code,
      ttl_minutes: OTP_TTL_MINUTES,
    },
  });

  return {
    email: normalized,
    expires_in_seconds: OTP_TTL_MINUTES * 60,
    // Dev/test convenience only — never returned when Brevo is configured in production
    ...(config.nodeEnv !== 'production' && !config.brevo.apiKey
      ? { dev_otp: code }
      : {}),
  };
}

/**
 * POST /api/auth/guest/otp/verify — single-use OTP; issues short-lived guest JWT.
 */
export async function verifyGuestOtp({ email, otp }) {
  const normalized = email.toLowerCase();
  const candidates = await prisma.guestOtp.findMany({
    where: { email: normalized },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  const record = candidates.find((r) => !r.usedAt);
  if (!record) throw new AppError('No active OTP for this email', 400);
  if (record.expiresAt.getTime() < Date.now()) {
    throw new AppError('OTP has expired', 400);
  }

  const ok = await verifyPassword(String(otp), record.codeHash);
  if (!ok) throw new AppError('Invalid OTP', 401);

  await prisma.guestOtp.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  let guest = await prisma.guest.findUnique({ where: { email: normalized } });
  if (!guest) {
    guest = await prisma.guest.create({ data: { email: normalized } });
  }

  const token = signToken(
    { sub: guest.id, role: 'guest', email: guest.email },
    { expiresIn: GUEST_SESSION_TTL },
  );

  return {
    token,
    guest: {
      id: guest.id,
      email: guest.email,
      name: guest.name,
    },
  };
}

export function logoutGuest() {
  // Stateless JWT — client discards token. Endpoint confirms logout.
  return { message: 'Logged out' };
}
