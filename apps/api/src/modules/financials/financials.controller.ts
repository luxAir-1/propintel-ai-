import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialsService } from './financials.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Financials')
@ApiBearerAuth()
@Controller('financials')
export class FinancialsController {
  constructor(private financialsService: FinancialsService) {}

  @Post(':listingId')
  @ApiOperation({ summary: 'Calculate financial metrics for property' })
  async calculate(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
    @Body() data: any,
  ) {
    return this.financialsService.calculate(userId, listingId, data);
  }

  @Get(':listingId')
  @ApiOperation({ summary: 'Get financial analysis for property' })
  async getFinancials(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.financialsService.getFinancials(userId, listingId);
  }
}
