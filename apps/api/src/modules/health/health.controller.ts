import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  async check() {
    return this.healthService.check();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async readiness() {
    return this.healthService.readiness();
  }

  @Public()
  @Get('queues')
  @ApiOperation({ summary: 'Get queue status' })
  async queueStatus() {
    return this.healthService.getQueueStatus();
  }
}
