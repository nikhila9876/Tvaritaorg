/** Single source for Person A pricing and split — do not scatter literals. */
export const BOOKING_RATES = {
  individual: 200,
  school: 50,
  corporate: 500,
};

export const ARTIST_SHARE_RATE = 0.7;
export const ADMIN_SHARE_RATE = 0.3;

export const SLOT_HOLD_MINUTES = 10;
export const PAYMENT_WINDOW_HOURS = 48;
export const OTP_TTL_MINUTES = 5;
export const GUEST_SESSION_TTL = '2h';

export function computeGrossAmount(bookingType, headcount) {
  const rate = BOOKING_RATES[bookingType];
  if (rate == null) {
    throw new Error(`Unknown booking type: ${bookingType}`);
  }
  return {
    rate_per_head: rate,
    headcount,
    gross_amount: rate * headcount,
  };
}

export function computeSplit(grossAmount) {
  const artistShare = Math.round(grossAmount * ARTIST_SHARE_RATE * 100) / 100;
  const adminShare = Math.round(grossAmount * ADMIN_SHARE_RATE * 100) / 100;
  return {
    artist_share: artistShare,
    admin_share: adminShare,
    artist_share_rate: ARTIST_SHARE_RATE,
    admin_share_rate: ADMIN_SHARE_RATE,
  };
}
