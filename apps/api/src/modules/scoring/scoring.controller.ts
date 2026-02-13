import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Scoring')
@ApiBearerAuth()
@Controller('scoring')
export class ScoringController {
  constructor(private scoringService: ScoringService) {}

  @Post(':listingId/score')
  @ApiOperation({ summary: 'Score a property (async)' })
  async scoreProperty(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.scoringService.scoreProperty(userId, listingId);
  }

  @Get(':listingId/score')
  @ApiOperation({ summary: 'Get property score' })
  async getScore(
    @CurrentUser('sub') userId: string,
    @Param('listingId') listingId: string,
  ) {
    return this.scoringService.getScore(userId, listingId);
  }
}
