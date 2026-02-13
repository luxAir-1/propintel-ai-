import { Worker, Queue } from 'bullmq';
import puppeteer from 'puppeteer';
import { v4 as uuid } from 'uuid';
import redis from '@/config/redis';
import prisma from '@/config/prisma';
import logger from '@/config/logger';
import { generateReportHTML } from '@/services/report.service';

interface PDFJob {
  reportId: string;
  listingId: string;
  userId: string;
}

export class PDFWorker {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private browser: any = null;

  async start() {
    // Initialize Puppeteer
    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('✅ Puppeteer browser launched');
    } catch (error) {
      logger.error('❌ Failed to launch browser:', error);
      throw error;
    }

    this.queue = new Queue('reports', { connection: redis });

    this.worker = new Worker('reports', this.processJob.bind(this), {
      connection: redis,
      concurrency: 2,
      settings: {
        retryProcessDelay: 5000,
        maxStalledCount: 2,
        lockDuration: 60000,
      },
    });

    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, '✅ PDF job completed');
    });

    this.worker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, error: err.message },
        '❌ PDF job failed',
      );
    });

    this.worker.on('error', (err) => {
      logger.error('❌ Worker error:', err);
    });

    logger.info('🟢 PDF worker started');
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    logger.info('🔴 PDF worker stopped');
  }

  private async processJob(job: any) {
    const { reportId, listingId, userId } = job.data as PDFJob;

    logger.info({ reportId, listingId }, '⏳ Processing PDF job');

    try {
      // Fetch listing and related data
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          score: true,
          financials: true,
        },
      });

      if (!listing || listing.userId !== userId) {
        throw new Error(`Listing ${listingId} not found`);
      }

      // Update report status
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'generating' },
      });

      // Generate HTML
      const html = generateReportHTML({
        listing,
        score: listing.score,
        financials: listing.financials,
      });

      // Generate PDF with Puppeteer
      const page = await this.browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await page.close();

      // TODO: Upload to Cloudflare R2
      // For now, we'll simulate storage with a mock URL
      const s3Url = `s3://propintel-pdfs/${uuid()}.pdf`;
      const signedUrl = `https://r2.example.com/reports/${uuid()}.pdf`;

      // Update report
      const report = await prisma.report.update({
        where: { id: reportId },
        data: {
          status: 'ready',
          s3Url,
          signedUrl,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      logger.info(
        { reportId, size: pdfBuffer.length },
        '✅ PDF generated',
      );

      // TODO: Send email notification
      // await sendReportEmail(user.email, report.title, signedUrl);

      // Log usage
      await prisma.usageLogs.create({
        data: {
          userId,
          action: 'report_generated',
          metadata: {
            reportId,
            listingId,
            pdfSize: pdfBuffer.length,
          },
        },
      });

      return report;
    } catch (error) {
      // Update report with error
      await prisma.report.update({
        where: { id: reportId },
        data: { status: 'failed' },
      });

      logger.error(
        { reportId, error: (error as Error).message },
        '❌ PDF generation failed',
      );
      throw error;
    }
  }
}

// Standalone execution
if (require.main === module) {
  const worker = new PDFWorker();
  worker.start();

  process.on('SIGTERM', async () => {
    await worker.stop();
    process.exit(0);
  });
}
