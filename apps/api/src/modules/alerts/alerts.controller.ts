import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(
    private alertsService: AlertsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new alert',
    description: 'Subject to subscription limits. Check /subscriptions/limits for usage.'
  })
  async create(@CurrentUser('sub') userId: string, @Body() data: any) {
    // Check usage limits
    const canCreate = await this.subscriptionsService.canCreateAlert(userId);
    if (!canCreate) {
      const limits = await this.subscriptionsService.getUsageLimits(userId);
      throw new ForbiddenException(
        `Alert limit reached (${limits.maxAlerts}). Please upgrade your plan.`
      );
    }

    return this.alertsService.createAlert(userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List user alerts' })
  async list(@CurrentUser('sub') userId: string) {
    return this.alertsService.listAlerts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get alert details' })
  async getOne(
    @CurrentUser('sub') userId: string,
    @Param('id') alertId: string,
  ) {
    return this.alertsService.getAlert(userId, alertId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update alert' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') alertId: string,
    @Body() data: any,
  ) {
    return this.alertsService.updateAlert(userId, alertId, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete alert' })
  async delete(
    @CurrentUser('sub') userId: string,
    @Param('id') alertId: string,
  ) {
    return this.alertsService.deleteAlert(userId, alertId);
  }
}
