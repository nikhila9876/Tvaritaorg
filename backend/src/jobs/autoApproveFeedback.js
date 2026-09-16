import cron from 'node-cron';
import { autoApproveStaleFeedback } from '../services/feedbackService.js';

/**
 * Runs every hour; auto-approves feedback pending longer than 72h.
 */
export function startFeedbackAutoApproveJob() {
  cron.schedule('0 * * * *', async () => {
    try {
      const result = await autoApproveStaleFeedback(72);
      if (result.approved > 0) {
        console.log(
          `[job:auto-approve-feedback] approved=${result.approved} scanned=${result.scanned}`,
        );
      }
    } catch (err) {
      console.error('[job:auto-approve-feedback] failed', err);
    }
  });
  console.log('[job:auto-approve-feedback] scheduled (hourly)');
}
