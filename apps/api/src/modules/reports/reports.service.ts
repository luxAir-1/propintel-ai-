import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(userId: string, listingId: string) {
    // TODO: Integrate with BullMQ report queue
    // Dispatch to PDF worker
    // For now, return mock report

    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing || listing.userId !== userId) {
      throw new NotFoundException('Listing not found');
    }

    const report = await this.prisma.report.create({
      data: {
        userId,
        listingId,
        title: `Property Report - ${listing.address}`,
        status: 'generating',
      },
    });

    return {
      reportId: report.id,
      status: 'generating',
      message: 'Report is being generated. You will receive an email when ready.',
    };
  }

  async getReport(userId: string, reportId: string) {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report || report.userId !== userId) {
      throw new NotFoundException('Report not found');
    }

    // Generate signed URL if ready
    if (report.status === 'ready' && report.s3Url) {
      const signedUrl = this.generateSignedUrl(report.s3Url);
      return {
        ...report,
        downloadUrl: signedUrl,
      };
    }

    return report;
  }

  async listReports(userId: string) {
    return this.prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  private generateSignedUrl(s3Url: string): string {
    // TODO: Generate actual signed URL with Cloudflare R2
    return s3Url;
  }
}
