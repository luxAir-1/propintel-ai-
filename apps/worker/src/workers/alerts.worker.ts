import { Worker, Queue } from 'bullmq';
import { Resend } from 'resend';
import redis from '@/config/redis';
import prisma from '@/config/prisma';
import logger from '@/config/logger';

interface AlertJob {
  listingId: string;
  userId: string;
}

interface AlertCriteria {
  minScore: number;
  maxPrice: number;
  minROI: number;
  cities: string[];
  listingTypes: string[];
}

export class AlertsWorker {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async start() {
    this.queue = new Queue('alerts', { connection: redis });

    this.worker = new Worker('alerts', this.processJob.bind(this), {
      connection: redis,
      concurrency: 5,
      settings: {
        retryProcessDelay: 3000,
        maxStalledCount: 2,
        lockDuration: 20000,
      },
    });

    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, '✅ Alert job completed');
    });

    this.worker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, error: err.message },
        '❌ Alert job failed',
      );
    });

    this.worker.on('error', (err) => {
      logger.error('❌ Worker error:', err);
    });

    logger.info('🟢 Alerts worker started');
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
    logger.info('🔴 Alerts worker stopped');
  }

  private async processJob(job: any) {
    const { listingId, userId } = job.data as AlertJob;

    logger.info({ listingId, userId }, '⏳ Processing alert check');

    try {
      // Fetch listing with score
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          score: true,
          financials: true,
        },
      });

      if (!listing) {
        throw new Error(`Listing ${listingId} not found`);
      }

      // Fetch user alerts
      const alerts = await prisma.alert.findMany({
        where: {
          userId,
          isActive: true,
        },
      });

      if (alerts.length === 0) {
        logger.debug({ userId }, 'No active alerts for user');
        return;
      }

      // Check each alert
      const matchedAlerts: any[] = [];

      for (const alert of alerts) {
        const criteria = alert.criteria as AlertCriteria;

        if (this.matchesCriteria(listing, criteria)) {
          matchedAlerts.push(alert);
        }
      }

      // Send notifications for matched alerts
      if (matchedAlerts.length > 0) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          await this.sendAlertEmails(user, listing, matchedAlerts);
        }
      }

      logger.info(
        { listingId, matchedAlerts: matchedAlerts.length },
        '✅ Alert check completed',
      );

      return { matchedAlerts: matchedAlerts.length };
    } catch (error) {
      logger.error(
        { listingId, error: (error as Error).message },
        '❌ Alert check failed',
      );
      throw error;
    }
  }

  private matchesCriteria(listing: any, criteria: AlertCriteria): boolean {
    // Check price
    if (listing.price > criteria.maxPrice) {
      return false;
    }

    // Check score if available
    if (listing.score && listing.score.score < criteria.minScore) {
      return false;
    }

    // Check ROI if available
    if (
      listing.financials &&
      listing.financials.roiPercent < criteria.minROI
    ) {
      return false;
    }

    // Check city
    if (
      criteria.cities.length > 0 &&
      !criteria.cities.includes(listing.city)
    ) {
      return false;
    }

    // Check listing type
    if (
      criteria.listingTypes.length > 0 &&
      !criteria.listingTypes.includes(listing.listingType)
    ) {
      return false;
    }

    return true;
  }

  private async sendAlertEmails(
    user: any,
    listing: any,
    alerts: any[],
  ) {
    const alertNames = alerts.map((a) => a.name).join(', ');

    const emailContent = `
    <h2>Property Alert Match! 🏠</h2>
    <p>Hi ${user.name},</p>
    <p>A new property matches your alerts: <strong>${alertNames}</strong></p>

    <h3>${listing.address}</h3>
    <p>${listing.city}, ${listing.state}</p>

    <p><strong>Price:</strong> $${listing.price}</p>
    <p><strong>Beds/Baths:</strong> ${listing.beds}/${listing.baths}</p>
    <p><strong>Sqft:</strong> ${listing.sqft}</p>

    ${
      listing.score
        ? `<p><strong>Score:</strong> ${listing.score.score}/100</p>`
        : ''
    }
    ${
      listing.financials
        ? `<p><strong>Projected ROI:</strong> ${listing.financials.roiPercent}%</p>`
        : ''
    }

    <p><a href="https://propintel.app/listings/${listing.id}">View Property</a></p>
    `;

    try {
      await this.resend.emails.send({
        from: 'alerts@propintel.ai',
        to: user.email,
        subject: `Property Alert: ${listing.address} matches your criteria`,
        html: emailContent,
      });

      // Log delivery
      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      if (subscription) {
        await prisma.deliveryLog.create({
          data: {
            subscriptionId: subscription.id,
            channel: 'email',
            recipient: user.email,
            status: 'sent',
            metadata: {
              listingId: listing.id,
              alertCount: alerts.length,
            },
          },
        });
      }

      logger.info({ userId: user.id, email: user.email }, '📧 Alert email sent');
    } catch (error) {
      logger.error(
        { userId: user.id, error: (error as Error).message },
        '❌ Failed to send alert email',
      );
    }
  }
}

// Standalone execution
if (require.main === module) {
  const worker = new AlertsWorker();
  worker.start();

  process.on('SIGTERM', async () => {
    await worker.stop();
    process.exit(0);
  });
}
