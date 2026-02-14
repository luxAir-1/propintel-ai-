import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class AlertsService {
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async createAlert(userId: string, data: any) {
    return this.prisma.alert.create({
      data: {
        userId,
        name: data.name,
        criteria: data.criteria,
        isActive: true,
      },
    });
  }

  async listAlerts(userId: string) {
    return this.prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAlert(userId: string, alertId: string) {
    const alert = await this.prisma.alert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      throw new NotFoundException('Alert not found');
    }

    return alert;
  }

  async updateAlert(userId: string, alertId: string, data: any) {
    await this.getAlert(userId, alertId);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.criteria && { criteria: data.criteria }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteAlert(userId: string, alertId: string) {
    await this.getAlert(userId, alertId);

    return this.prisma.alert.delete({
      where: { id: alertId },
    });
  }

  async checkAlerts(listingId: string, userId: string): Promise<string> {
    // Dispatch alert matching job to BullMQ queue
    const jobId = await this.queueService.dispatchAlertJob(listingId, userId);
    return jobId;
  }

  async getJobStatus(jobId: string) {
    return this.queueService.getJobStatus('alerts', jobId);
  }
}
