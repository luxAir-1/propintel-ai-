import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class ListingsService {
  private logger = new Logger(ListingsService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async create(userId: string, data: any) {
    const listing = await this.prisma.listing.create({
      data: {
        ...data,
        userId,
      },
      include: {
        score: true,
        financials: true,
      },
    });

    // Dispatch scoring job when listing is created
    try {
      await this.queueService.dispatchScoringJob(listing.id, userId);
      // Dispatch alert check job
      await this.queueService.dispatchAlertJob(listing.id, userId);
      this.logger.log(`📨 Queued scoring and alert check for listing ${listing.id}`);
    } catch (error) {
      this.logger.error(`Failed to queue jobs for listing ${listing.id}:`, error);
      // Don't fail listing creation if queue dispatch fails
    }

    return listing;
  }

  async findById(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        score: true,
        financials: true,
        reports: true,
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return listing;
  }

  async findMany(userId: string, options: any = {}) {
    const {
      skip = 0,
      take = 20,
      city,
      state,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const where: any = { userId };

    if (city) where.city = city;
    if (state) where.state = state;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: sortOrder },
        include: {
          score: true,
          financials: true,
        },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      listings,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take),
    };
  }

  async update(userId: string, listingId: string, data: any) {
    await this.findById(userId, listingId);

    return this.prisma.listing.update({
      where: { id: listingId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: {
        score: true,
        financials: true,
      },
    });
  }

  async delete(userId: string, listingId: string) {
    await this.findById(userId, listingId);

    return this.prisma.listing.delete({
      where: { id: listingId },
    });
  }

  async search(userId: string, criteria: any) {
    const where: any = { userId };

    if (criteria.cities?.length) where.city = { in: criteria.cities };
    if (criteria.states?.length) where.state = { in: criteria.states };
    if (criteria.minPrice) where.price = { gte: criteria.minPrice };
    if (criteria.maxPrice) {
      if (!where.price) where.price = {};
      where.price.lte = criteria.maxPrice;
    }

    return this.prisma.listing.findMany({
      where,
      include: {
        score: true,
        financials: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
