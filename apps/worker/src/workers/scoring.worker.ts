import { Worker, Queue } from 'bullmq';
import Anthropic from '@anthropic-ai/sdk';
import redis from '@/config/redis';
import prisma from '@/config/prisma';
import logger from '@/config/logger';

interface ScoringJob {
  listingId: string;
  userId: string;
}

export class ScoringWorker {
  private worker: Worker | null = null;
  private queue: Queue | null = null;
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async start() {
    this.queue = new Queue('scoring', { connection: redis });

    this.worker = new Worker('scoring', this.processJob.bind(this), {
      connection: redis,
      concurrency: 3,
    });

    this.worker.on('completed', (job) => {
      logger.info({ jobId: job.id }, '✅ Scoring job completed');
    });

    this.worker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, error: err.message },
        '❌ Scoring job failed',
      );
    });

    this.worker.on('error', (err) => {
      logger.error('❌ Worker error:', err);
    });

    logger.info('🟢 Scoring worker started');
  }

  async stop() {
    if (this.worker) {
      await this.worker.close();
    }
    if (this.queue) {
      await this.queue.close();
    }
    logger.info('🔴 Scoring worker stopped');
  }

  private async processJob(job: any) {
    const { listingId, userId } = job.data as ScoringJob;

    logger.info(
      { listingId, userId },
      '⏳ Processing scoring job',
    );

    try {
      // Fetch listing with financials
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
          financials: true,
        },
      });

      if (!listing) {
        throw new Error(`Listing ${listingId} not found`);
      }

      // Prepare scoring context
      const scoringContext = `
Property Address: ${listing.address}, ${listing.city}, ${listing.state}
Price: $${listing.price}
Beds: ${listing.beds} | Baths: ${listing.baths} | Sqft: ${listing.sqft}
Type: ${listing.listingType}

${
  listing.financials
    ? `
Financial Metrics:
- Monthly Payment: $${listing.financials.monthlyPayment}
- Rental Income: $${listing.financials.rentalIncome}
- Monthly Profit: $${listing.financials.cashFlow}
- Cap Rate: ${listing.financials.capRate}%
- ROI: ${listing.financials.roiPercent}%
`
    : 'No financial data available'
}

Based on these metrics, provide a deal score from 0-100 and analysis.
`;

      // Call Claude API for scoring
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `Score this real estate deal and provide investment analysis:\n\n${scoringContext}\n\nProvide response in JSON format: { "score": number, "summary": string, "strengths": string[], "weaknesses": string[] }`,
          },
        ],
      });

      // Parse response
      const content = message.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      let scoreData;
      try {
        // Extract JSON from response
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        scoreData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        logger.warn(
          { response: content.text },
          'Failed to parse Claude response, using fallback',
        );
        // Fallback: use heuristic scoring
        scoreData = this.getFallbackScore(listing);
      }

      // Validate score
      const score = Math.max(0, Math.min(100, Math.round(scoreData.score)));

      // Store in database
      const result = await prisma.propertyScore.upsert({
        where: { listingId },
        create: {
          listingId,
          userId,
          score,
          summary: scoreData.summary || 'AI analysis complete',
          strengths: scoreData.strengths || [],
          weaknesses: scoreData.weaknesses || [],
          modelVersion: 'claude-3.5-sonnet-v1',
        },
        update: {
          score,
          summary: scoreData.summary || 'AI analysis complete',
          strengths: scoreData.strengths || [],
          weaknesses: scoreData.weaknesses || [],
          updatedAt: new Date(),
        },
      });

      logger.info(
        { listingId, score: result.score },
        '✅ Score generated',
      );

      // Log usage
      await prisma.usageLogs.create({
        data: {
          userId,
          action: 'property_scored',
          metadata: {
            listingId,
            score: result.score,
            model: 'claude-3.5-sonnet',
          },
        },
      });

      return result;
    } catch (error) {
      logger.error(
        { listingId, error: (error as Error).message },
        '❌ Scoring failed',
      );
      throw error;
    }
  }

  private getFallbackScore(listing: any) {
    // Heuristic scoring if Claude fails
    let score = 50;

    if (listing.financials) {
      const roi = listing.financials.roiPercent;
      const capRate = listing.financials.capRate;

      // Adjust based on ROI
      if (roi > 20) score += 20;
      else if (roi > 15) score += 15;
      else if (roi > 10) score += 10;

      // Adjust based on cap rate
      if (capRate > 6) score += 10;
      else if (capRate > 5) score += 5;
    }

    return {
      score: Math.min(100, score),
      summary: 'Fallback scoring - AI analysis unavailable',
      strengths: ['Listed and available'],
      weaknesses: ['Limited financial data'],
    };
  }
}

// Standalone execution
if (require.main === module) {
  const worker = new ScoringWorker();
  worker.start();

  process.on('SIGTERM', async () => {
    await worker.stop();
    process.exit(0);
  });
}
