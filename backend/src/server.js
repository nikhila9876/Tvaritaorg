import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config/index.js';
import { startFeedbackAutoApproveJob } from './jobs/autoApproveFeedback.js';

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  startFeedbackAutoApproveJob();
  app.listen(config.port, () => {
    console.log(`Tvarita Person B API listening on :${config.port}`);
  });
}

export default app;
