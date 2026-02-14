import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        language: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, data: any) {
    return this.prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.language && { language: data.language }),
        ...(data.timezone && { timezone: data.timezone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        language: true,
        timezone: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async getUsageStats(userId: string) {
    const stats = await this.prisma.usageLogs.groupBy({
      by: ['action'],
      where: { userId },
      _count: true,
    });

    return {
      userId,
      totalActions: stats.reduce((sum: number, s: { action: string; _count: number }) => sum + s._count, 0),
      byAction: stats.map((s: { action: string; _count: number }) => ({
        action: s.action,
        count: s._count,
      })),
    };
  }
}
