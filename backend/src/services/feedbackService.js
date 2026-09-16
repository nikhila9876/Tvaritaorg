import { prisma } from '../config/db.js';
import { AppError } from '../utils/helpers.js';
import { sendNotification } from './notificationService.js';

export async function createFeedback(input) {
  const artist = await prisma.artist.findUnique({ where: { id: input.artist_id } });
  if (!artist) throw new AppError('Artist not found', 404);

  const existing = await prisma.feedback.findUnique({
    where: {
      guestEmail_eventId: {
        guestEmail: input.guest_email.toLowerCase(),
        eventId: input.event_id,
      },
    },
  });
  if (existing) {
    throw new AppError(
      'Feedback already submitted for this guest_email and event_id',
      409,
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      artistId: input.artist_id,
      eventId: input.event_id,
      guestEmail: input.guest_email.toLowerCase(),
      guestName: input.guest_name || null,
      rating: input.rating,
      comment: input.comment || null,
      status: 'pending',
    },
  });

  return formatFeedback(feedback);
}

export async function listApprovedFeedbackForArtist(artistId) {
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) throw new AppError('Artist not found', 404);

  const items = await prisma.feedback.findMany({
    where: { artistId, status: 'approved' },
    orderBy: { createdAt: 'desc' },
  });
  return items.map(formatFeedback);
}

export async function listAdminFeedback(status) {
  const where = status ? { status } : {};
  const items = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'asc' },
  });
  return items.map(formatFeedback);
}

export async function approveFeedback(feedbackId) {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw new AppError('Feedback not found', 404);
  if (feedback.status === 'approved') {
    return formatFeedback(feedback);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const fb = await tx.feedback.update({
      where: { id: feedbackId },
      data: { status: 'approved', reviewedAt: new Date() },
    });
    await recalculateArtistRating(tx, fb.artistId);
    return fb;
  });

  await sendNotification({
    channel: 'email',
    to: updated.guestEmail,
    template: 'feedback_status',
    data: { event_id: updated.eventId, status: 'approved' },
  }).catch(() => {});

  return formatFeedback(updated);
}

export async function rejectFeedback(feedbackId) {
  const feedback = await prisma.feedback.findUnique({ where: { id: feedbackId } });
  if (!feedback) throw new AppError('Feedback not found', 404);

  const updated = await prisma.$transaction(async (tx) => {
    const fb = await tx.feedback.update({
      where: { id: feedbackId },
      data: { status: 'rejected', reviewedAt: new Date() },
    });
    await recalculateArtistRating(tx, fb.artistId);
    return fb;
  });

  await sendNotification({
    channel: 'email',
    to: updated.guestEmail,
    template: 'feedback_status',
    data: { event_id: updated.eventId, status: 'rejected' },
  }).catch(() => {});

  return formatFeedback(updated);
}

/**
 * Auto-approve feedback still pending after 72 hours.
 */
export async function autoApproveStaleFeedback(olderThanHours = 72) {
  const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
  const stale = await prisma.feedback.findMany({
    where: {
      status: 'pending',
      createdAt: { lte: cutoff },
    },
  });

  let approved = 0;
  for (const item of stale) {
    await prisma.$transaction(async (tx) => {
      await tx.feedback.update({
        where: { id: item.id },
        data: { status: 'approved', reviewedAt: new Date() },
      });
      await recalculateArtistRating(tx, item.artistId);
    });
    approved += 1;
  }

  return { scanned: stale.length, approved };
}

async function recalculateArtistRating(tx, artistId) {
  const approved = await tx.feedback.findMany({
    where: { artistId, status: 'approved' },
    select: { rating: true },
  });
  const ratingCount = approved.length;
  const ratingAvg =
    ratingCount === 0
      ? 0
      : approved.reduce((sum, f) => sum + f.rating, 0) / ratingCount;

  await tx.artist.update({
    where: { id: artistId },
    data: { ratingAvg, ratingCount },
  });
}

export function formatFeedback(f) {
  return {
    id: f.id,
    artist_id: f.artistId,
    event_id: f.eventId,
    guest_email: f.guestEmail,
    guest_name: f.guestName,
    rating: f.rating,
    comment: f.comment,
    status: f.status,
    created_at: f.createdAt,
    reviewed_at: f.reviewedAt,
  };
}
