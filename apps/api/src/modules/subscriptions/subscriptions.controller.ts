import { Controller, Get, Post, Body, Param, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { CreateCheckoutSessionDto } from './dtos/checkout.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current subscription' })
  async getCurrent(@CurrentUser('sub') userId: string) {
    return this.subscriptionsService.getSubscription(userId);
  }

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get all available subscription plans' })
  async getPlans() {
    return this.subscriptionsService.getAvailablePlans();
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get usage limits for current plan' })
  async getLimits(@CurrentUser('sub') userId: string) {
    return this.subscriptionsService.getUsageLimits(userId);
  }

  @Post('checkout/:plan')
  @ApiOperation({
    summary: 'Create checkout session for plan upgrade',
    description: 'Returns Stripe checkout URL for subscribing to a plan',
  })
  async createCheckout(
    @CurrentUser('sub') userId: string,
    @Param('plan') plan: string,
    @Body() data: CreateCheckoutSessionDto,
  ) {
    return this.subscriptionsService.createCheckoutSession(userId, plan, data);
  }

  @Post('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancel(@CurrentUser('sub') userId: string) {
    return this.subscriptionsService.cancel(userId);
  }
}
