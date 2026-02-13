import 'dotenv/config';
import pino from 'pino';
import { ScoringWorker } from './workers/scoring.worker';
import { PDFWorker } from './workers/pdf.worker';
import { AlertsWorker } from './workers/alerts.worker';

const logger = pino();

async function main() {
  logger.info('🚀 Starting PropIntel Workers');

  try {
    // Initialize workers
    const scoringWorker = new ScoringWorker();
    const pdfWorker = new PDFWorker();
    const alertsWorker = new AlertsWorker();

    // Start all workers in parallel
    await Promise.all([
      scoringWorker.start(),
      pdfWorker.start(),
      alertsWorker.start(),
    ]);

    logger.info('✅ All workers started successfully');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('⏹️ Shutting down workers...');
      await Promise.all([
        scoringWorker.stop(),
        pdfWorker.stop(),
        alertsWorker.stop(),
      ]);
      logger.info('✅ Workers stopped');
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('⏹️ Shutting down workers (SIGINT)...');
      await Promise.all([
        scoringWorker.stop(),
        pdfWorker.stop(),
        alertsWorker.stop(),
      ]);
      logger.info('✅ Workers stopped');
      process.exit(0);
    });
  } catch (error) {
    logger.error('❌ Failed to start workers:', error);
    process.exit(1);
  }
}

main();
