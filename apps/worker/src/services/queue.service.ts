import { Queue } from 'bullmq';
import redis from '@/config/redis';

// Create queue instances
export const scoringQueue = new Queue('scoring', { connection: redis });
export const reportQueue = new Queue('reports', { connection: redis });
export const alertQueue = new Queue('alerts', { connection: redis });

// Dispatch functions
export async function dispatchScoringJob(listingId: string, userId: string) {
  const job = await scoringQueue.add(
    'score-property',
    { listingId, userId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return job;
}

export async function dispatchPDFJob(
  reportId: string,
  listingId: string,
  userId: string,
) {
  const job = await reportQueue.add(
    'generate-pdf',
    { reportId, listingId, userId },
    {
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 5000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return job;
}

export async function dispatchAlertJob(listingId: string, userId: string) {
  const job = await alertQueue.add(
    'check-alerts',
    { listingId, userId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  return job;
}

// Queue monitoring functions
export async function getQueueStatus(queueName: 'scoring' | 'reports' | 'alerts') {
  let queue: Queue;

  switch (queueName) {
    case 'scoring':
      queue = scoringQueue;
      break;
    case 'reports':
      queue = reportQueue;
      break;
    case 'alerts':
      queue = alertQueue;
      break;
  }

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  return {
    queue: queueName,
    waiting,
    active,
    completed,
    failed,
  };
}

export async function getAllQueuesStatus() {
  const [scoring, reports, alerts] = await Promise.all([
    getQueueStatus('scoring'),
    getQueueStatus('reports'),
    getQueueStatus('alerts'),
  ]);

  return { scoring, reports, alerts };
}
