import { prisma } from '../../config/db.js';
import { AppError } from '../../utils/helpers.js';
import { sendNotification } from '../notificationService.js';
import {
  ARTIST_SHARE_RATE,
  computeGrossAmount,
  computeSplit,
  PAYMENT_WINDOW_HOURS,
  SLOT_HOLD_MINUTES,
} from '../../constants/pricing.js';

function formatPayment(p) {
  return {
    id: p.id,
    booking_id: p.bookingId,
    amount: p.amount,
    currency: p.currency,
    headcount: p.headcount,
    rate_per_head: p.ratePerHead,
    status: p.status,
    gateway_payment_id: p.gatewayPaymentId,
    gateway_order_id: p.gatewayOrderId,
    split_recorded: p.splitRecorded,
    confirmed_at: p.confirmedAt,
    created_at: p.createdAt,
  };
}

/**
 * POST /api/payments/create — amount from named rate table × headcount.
 */
export async function createPayment({ bookingId, idempotencyKey }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', 404);

  if (
    !['hold', 'awaiting_payment', 'pending'].includes(booking.status)
  ) {
    throw new AppError(`Cannot create payment for status=${booking.status}`, 409);
  }

  if (idempotencyKey) {
    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey },
    });
    if (existing) return formatPayment(existing);
  }

  const type = booking.bookingType || 'individual';
  const pricing = computeGrossAmount(
    type === 'guest' ? 'individual' : type,
    booking.headcount,
  );

  const payment = await prisma.payment.create({
    data: {
      bookingId,
      amount: pricing.gross_amount,
      headcount: pricing.headcount,
      ratePerHead: pricing.rate_per_head,
      status: 'pending',
      gatewayOrderId: `order_${bookingId}_${Date.now()}`,
      idempotencyKey: idempotencyKey || null,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: { grossAmount: pricing.gross_amount },
  });

  return formatPayment(payment);
}

/**
 * POST /api/payments/webhook — idempotent on gateway_payment_id.
 * Success: confirm booking, record 70/30 split once, send confirmation email.
 */
export async function handlePaymentWebhook({
  gateway_payment_id,
  gateway_order_id,
  payment_id,
  status,
}) {
  if (!gateway_payment_id && !payment_id) {
    throw new AppError('gateway_payment_id or payment_id required', 400);
  }

  const payment = payment_id
    ? await prisma.payment.findUnique({ where: { id: payment_id } })
    : await prisma.payment.findFirst({
        where: {
          OR: [
            { gatewayPaymentId: gateway_payment_id },
            ...(gateway_order_id ? [{ gatewayOrderId: gateway_order_id }] : []),
          ],
        },
      });

  if (!payment) throw new AppError('Payment not found', 404);

  // Idempotent success path
  if (payment.status === 'succeeded' && payment.splitRecorded) {
    return {
      payment: formatPayment(payment),
      idempotent: true,
      message: 'Payment already processed',
    };
  }

  if (status !== 'succeeded' && status !== 'success') {
    const failed = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
        gatewayPaymentId: gateway_payment_id || payment.gatewayPaymentId,
      },
    });
    return { payment: formatPayment(failed), idempotent: false };
  }

  const result = await prisma.$transaction(async (tx) => {
    const current = await tx.payment.findUnique({ where: { id: payment.id } });
    if (current.status === 'succeeded' && current.splitRecorded) {
      return { payment: current, idempotent: true };
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
        gatewayPaymentId: gateway_payment_id || current.gatewayPaymentId,
        confirmedAt: new Date(),
        splitRecorded: true,
      },
    });

    const booking = await tx.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'confirmed',
        holdExpiresAt: null,
        paymentWindowExpiresAt: null,
        grossAmount: updatedPayment.amount,
      },
    });

    if (booking.slotId) {
      await tx.timeSlot.updateMany({
        where: { id: booking.slotId },
        data: {
          available: false,
          lockedUntil: null,
          lockedByBookingId: booking.id,
        },
      });
    }

    if (booking.artistId && booking.eventId) {
      const existing = await tx.payout.findFirst({
        where: {
          artistId: booking.artistId,
          eventId: booking.eventId,
          bookingId: booking.id,
        },
      });
      if (!existing) {
        const split = computeSplit(updatedPayment.amount);
        await tx.payout.create({
          data: {
            artistId: booking.artistId,
            eventId: booking.eventId,
            bookingId: booking.id,
            grossAmount: updatedPayment.amount,
            artistShare: split.artist_share,
            status: 'pending',
          },
        });
      }
    }

    return { payment: updatedPayment, booking, idempotent: false };
  });

  if (!result.idempotent && result.booking) {
    await sendNotification({
      channel: 'email',
      to: result.booking.guestEmail,
      template: 'booking_confirmation',
      data: {
        name: result.booking.guestName,
        booking_id: result.booking.id,
        amount: result.payment.amount,
      },
    }).catch(() => {});
  }

  return {
    payment: formatPayment(result.payment),
    idempotent: result.idempotent,
    artist_share_rate: ARTIST_SHARE_RATE,
  };
}

export async function getPaymentStatus(paymentId) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new AppError('Payment not found', 404);
  return formatPayment(payment);
}

/**
 * Called when Person B (or admin) assigns an artist to a pending-admin booking.
 * Opens 48h payment window and notifies guest.
 */
export async function onManualArtistAssignment(bookingId, artistId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError('Booking not found', 404);

  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist || artist.status !== 'active') {
    throw new AppError('Artist not found or inactive', 400);
  }

  const paymentWindowExpiresAt = new Date(
    Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000,
  );

  const updated = await prisma.$transaction(async (tx) => {
    // Claim artist+date if date present
    if (booking.date) {
      try {
        await tx.artistDateHold.create({
          data: {
            artistId,
            date: booking.date,
            bookingId: booking.id,
          },
        });
      } catch (err) {
        if (err.code === 'P2002') {
          throw new AppError('Artist already held for this date', 409);
        }
        throw err;
      }
    }

    let eventId = booking.eventId;
    if (!eventId) {
      const event = await tx.event.create({
        data: {
          title: `${booking.bookingType || 'booking'} — ${booking.artForm || artist.artForm} — ${booking.date || 'TBD'}`,
          artForm: booking.artForm || artist.artForm,
          date: booking.date || new Date().toISOString().slice(0, 10),
        },
      });
      eventId = event.id;
    }

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        artistId,
        eventId,
        status: 'awaiting_payment',
        paymentWindowExpiresAt,
      },
    });
  });

  await sendNotification({
    channel: 'email',
    to: updated.guestEmail,
    template: 'payment_window',
    data: {
      name: updated.guestName,
      booking_id: updated.id,
      window_hours: PAYMENT_WINDOW_HOURS,
    },
  }).catch(() => {});

  return {
    booking_id: updated.id,
    event_id: updated.eventId,
    artist_id: artistId,
    status: updated.status,
    payment_window_expires_at: updated.paymentWindowExpiresAt,
  };
}

/**
 * Release unpaid Individual slot holds (10 min) and expired 48h payment windows.
 */
export async function releaseExpiredHolds() {
  const now = new Date();
  let releasedSlots = 0;
  let revertedPendingAdmin = 0;

  const expiredHolds = await prisma.booking.findMany({
    where: {
      status: 'hold',
      holdExpiresAt: { lte: now },
    },
  });

  for (const booking of expiredHolds) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'cancelled', holdExpiresAt: null },
      });
      if (booking.slotId) {
        await tx.timeSlot.updateMany({
          where: {
            id: booking.slotId,
            lockedByBookingId: booking.id,
          },
          data: {
            available: true,
            lockedUntil: null,
            lockedByBookingId: null,
          },
        });
      }
    });
    releasedSlots += 1;
  }

  const expiredWindows = await prisma.booking.findMany({
    where: {
      status: 'awaiting_payment',
      paymentWindowExpiresAt: { lte: now },
      bookingType: { in: ['school', 'corporate'] },
    },
  });

  for (const booking of expiredWindows) {
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: 'no_artist_available_pending_admin',
          artistId: null,
          paymentWindowExpiresAt: null,
          // Keep eventId for admin history, or null it — revert artist hold
        },
      });
      if (booking.artistId && booking.date) {
        await tx.artistDateHold.deleteMany({
          where: { artistId: booking.artistId, date: booking.date },
        });
      }
    });
    revertedPendingAdmin += 1;
  }

  // Also release slots whose lockedUntil passed without a booking update
  const staleSlots = await prisma.timeSlot.updateMany({
    where: {
      available: false,
      lockedUntil: { lte: now },
    },
    data: {
      available: true,
      lockedUntil: null,
      lockedByBookingId: null,
    },
  });

  return {
    released_slot_holds: releasedSlots,
    reverted_payment_windows: revertedPendingAdmin,
    stale_slots_freed: staleSlots.count,
    slot_hold_minutes: SLOT_HOLD_MINUTES,
    payment_window_hours: PAYMENT_WINDOW_HOURS,
  };
}
