import { prisma } from '../config/db.js';

/**
 * MongoDB does not enforce Prisma onDelete actions.
 * These helpers replicate the former relational cascades.
 * Person A should call deleteEventWithCascade (or equivalent) when removing events.
 */

/** Former: PasswordToken/TimeSlot/Feedback/Payout Cascade; Booking.artistId SetNull */
export async function deleteArtistWithCascade(artistId) {
  await prisma.$transaction(async (tx) => {
    await tx.passwordToken.deleteMany({ where: { artistId } });
    await tx.timeSlot.deleteMany({ where: { artistId } });
    await tx.feedback.deleteMany({ where: { artistId } });
    await tx.payout.deleteMany({ where: { artistId } });
    await tx.booking.updateMany({
      where: { artistId },
      data: { artistId: null },
    });
    await tx.artist.delete({ where: { id: artistId } });
  });
}

/** Former: Booking/Payout Cascade; also clears Feedback rows keyed by eventId */
export async function deleteEventWithCascade(eventId) {
  await prisma.$transaction(async (tx) => {
    await tx.payout.deleteMany({ where: { eventId } });
    await tx.booking.deleteMany({ where: { eventId } });
    await tx.feedback.deleteMany({ where: { eventId } });
    await tx.event.delete({ where: { id: eventId } });
  });
}
