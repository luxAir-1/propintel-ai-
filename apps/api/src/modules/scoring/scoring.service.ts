import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ScoringService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async scoreProperty(userId: string, listingId: string) {
    // Verify listing exists and belongs to user
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.userId !== userId) {
      throw new NotFoundException('Listing not found');
    }

    // Dispatch to BullMQ scoring queue
    const jobId = await this.queueService.dispatchScoringJob(listingId, userId);

    return {
      jobId,
      listingId,
      status: 'queued',
      message: 'Property is being scored. Check status with jobId.',
    };
  }

  async getScore(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { score: true },
    });

    if (!listing || listing.userId !== userId) {
      throw new NotFoundException('Listing not found');
    }

    return listing.score || null;
  }

  async getJobStatus(jobId: string) {
    return this.queueService.getJobStatus('scoring', jobId);
  }
}
