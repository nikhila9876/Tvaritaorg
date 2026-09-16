import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { startFeedbackAutoApproveJob } from './jobs/autoApproveFeedback.js';
import { startReleaseExpiredHoldsJob } from './jobs/releaseExpiredHolds.js';

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  startFeedbackAutoApproveJob();
  startReleaseExpiredHoldsJob();
  app.listen(config.port, () => {
    console.log(`Tvarita API (Person A + B) listening on :${config.port}`);
  });
}

export default app;
