import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ScoringService {
  constructor(private prisma: PrismaService) {}

  async scoreProperty(userId: string, listingId: string) {
    // TODO: Integrate with BullMQ queue
    // Dispatch to scoring worker
    // For now, return mock score

    const score = Math.round(Math.random() * 100);

    return {
      listingId,
      score,
      summary: `Deal score of ${score}/100 based on financial metrics and market analysis.`,
      strengths: ['Good location', 'Strong rental income'],
      weaknesses: ['High vacancy risk'],
      status: 'queued',
    };
  }

  async getScore(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: { score: true },
    });

    if (!listing || listing.userId !== userId) {
      throw new Error('Listing not found');
    }

    return listing.score;
  }
}
