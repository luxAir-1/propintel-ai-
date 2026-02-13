import { Controller, Post, Get, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  @Post(':listingId')
  @ApiOperation({
    summary: 'Generate PDF report for property',
    description: 'Subject to subscription limits. Check /subscriptions/limits for usage.'
  })
  async generateReport(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    // Check usage limits
    const canGenerate = await this.subscriptionsService.canGenerateReport(userId);
    if (!canGenerate) {
      const limits = await this.subscriptionsService.getUsageLimits(userId);
      throw new ForbiddenException(
        `Report limit reached (${limits.maxReports}). Please upgrade your plan.`
      );
    }

    return this.reportsService.generateReport(userId, listingId);
  }

  @Get()
  @ApiOperation({ summary: 'List user reports' })
  async listReports(@CurrentUser('sub') userId: string) {
    return this.reportsService.listReports(userId);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Get report details' })
  async getReport(
    @CurrentUser('sub') userId: string,
    @Param('reportId') reportId: string,
  ) {
    return this.reportsService.getReport(userId, reportId);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get PDF generation job status' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.reportsService.getJobStatus(jobId);
  }
}
