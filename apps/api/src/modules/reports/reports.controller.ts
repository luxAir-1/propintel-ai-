import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post(':listingId')
  @ApiOperation({ summary: 'Generate PDF report for property' })
  async generateReport(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
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
}
