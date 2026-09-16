import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import {
  generateRawToken,
  generateTempPassword,
  hashPassword,
  hashToken,
  verifyPassword,
} from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { AppError, publicArtist } from '../utils/helpers.js';
import { parseCsvBuffer, validateCsvRows } from '../utils/csv.js';
import { validateArtistRow } from '../validators/schemas.js';
import { sendNotification } from './notificationService.js';

const ARTIST_CSV_COLUMNS = ['email', 'name', 'phone', 'art_form', 'region', 'bio'];
const ARTIST_CSV_REQUIRED = ['email', 'name', 'art_form'];

/**
 * Create or update a single artist (CSV & manual share this path).
 * On create: default password hashed, status=active, set-password email.
 * On duplicate email: update profile fields (dedupe), do not create a new row.
 */
export async function upsertArtist(data, { sendInvite = true } = {}) {
  const existing = await prisma.artist.findUnique({ where: { email: data.email } });

  if (existing) {
    const updated = await prisma.artist.update({
      where: { id: existing.id },
      data: {
        name: data.name,
        phone: data.phone,
        artForm: data.artForm,
        region: data.region,
        bio: data.bio,
      },
    });
    return { artist: updated, created: false };
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const artist = await prisma.artist.create({
    data: {
      email: data.email,
      name: data.name,
      phone: data.phone,
      artForm: data.artForm,
      region: data.region,
      bio: data.bio,
      passwordHash,
      status: 'active',
      passwordSet: false,
    },
  });

  if (sendInvite) {
    await issueSetPasswordInvite(artist);
  }

  return { artist, created: true };
}

export async function issueSetPasswordInvite(artist) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + config.passwordTokenTtlHours * 60 * 60 * 1000,
  );

  await prisma.passwordToken.create({
    data: {
      artistId: artist.id,
      tokenHash,
      expiresAt,
    },
  });

  const link = `${config.frontendBaseUrl}/artist/set-password?token=${rawToken}`;

  await sendNotification({
    channel: 'email',
    to: artist.email,
    template: 'artist_set_password',
    data: {
      name: artist.name,
      link,
      ttl_hours: config.passwordTokenTtlHours,
    },
  });

  return { link, expiresAt };
}

export async function createArtistFromBody(body) {
  const result = validateArtistRow(body);
  if (result.error) {
    throw new AppError('Validation failed', 400, { errors: result.error });
  }
  const { artist, created } = await upsertArtist(result.data);
  return { artist: publicArtist(artist), created };
}

export async function importArtistsFromCsv(buffer) {
  const rows = parseCsvBuffer(buffer, {
    columns: ARTIST_CSV_COLUMNS,
    requiredColumns: ARTIST_CSV_REQUIRED,
  });
  const validRows = validateCsvRows(rows, validateArtistRow);

  // All-or-nothing: validate complete before any writes; then transactional upserts.
  const results = await prisma.$transaction(async (tx) => {
    const out = [];
    for (const row of validRows) {
      const data = row.data;
      const existing = await tx.artist.findUnique({ where: { email: data.email } });

      if (existing) {
        const updated = await tx.artist.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            phone: data.phone,
            artForm: data.artForm,
            region: data.region,
            bio: data.bio,
          },
        });
        out.push({ email: data.email, action: 'updated', id: updated.id });
      } else {
        const tempPassword = generateTempPassword();
        const passwordHash = await hashPassword(tempPassword);
        const created = await tx.artist.create({
          data: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            artForm: data.artForm,
            region: data.region,
            bio: data.bio,
            passwordHash,
            status: 'active',
            passwordSet: false,
          },
        });
        out.push({ email: data.email, action: 'created', id: created.id });
      }
    }
    return out;
  });

  // Send invites only for newly created artists (outside transaction).
  for (const item of results.filter((r) => r.action === 'created')) {
    const artist = await prisma.artist.findUnique({ where: { id: item.id } });
    if (artist) await issueSetPasswordInvite(artist);
  }

  return {
    total: results.length,
    created: results.filter((r) => r.action === 'created').length,
    updated: results.filter((r) => r.action === 'updated').length,
    results,
  };
}

export async function setArtistPassword(token, password) {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt) {
    throw new AppError('Invalid or already used token', 400);
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw new AppError('Token has expired', 400);
  }

  const passwordHash = await hashPassword(password);

  const artist = await prisma.$transaction(async (tx) => {
    await tx.passwordToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });
    return tx.artist.update({
      where: { id: record.artistId },
      data: {
        passwordHash,
        passwordSet: true,
      },
    });
  });

  return publicArtist(artist);
}

export async function loginArtist(email, password) {
  const artist = await prisma.artist.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!artist) throw new AppError('Invalid email or password', 401);

  const ok = await verifyPassword(password, artist.passwordHash);
  if (!ok) throw new AppError('Invalid email or password', 401);
  if (artist.status !== 'active') throw new AppError('Artist account is inactive', 403);

  const token = signToken({
    sub: artist.id,
    role: 'artist',
    email: artist.email,
  });

  return { token, artist: publicArtist(artist) };
}

export async function loginAdmin(email, password) {
  const admin = await prisma.admin.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!admin) throw new AppError('Invalid email or password', 401);

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) throw new AppError('Invalid email or password', 401);

  const token = signToken({
    sub: admin.id,
    role: 'admin',
    email: admin.email,
  });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
}
