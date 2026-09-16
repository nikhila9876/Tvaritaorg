import cron from 'node-cron';
import { releaseExpiredHolds } from '../services/personA/paymentService.js';

/** Every minute: release 10-min slot holds and expired 48h payment windows. */
export function startReleaseExpiredHoldsJob() {
  cron.schedule('* * * * *', async () => {
    try {
      const result = await releaseExpiredHolds();
      const touched =
        result.released_slot_holds +
        result.reverted_payment_windows +
        result.stale_slots_freed;
      if (touched > 0) {
        console.log('[job:release-expired-holds]', result);
      }
    } catch (err) {
      console.error('[job:release-expired-holds] failed', err);
    }
  });
  console.log('[job:release-expired-holds] scheduled (every minute)');
}
