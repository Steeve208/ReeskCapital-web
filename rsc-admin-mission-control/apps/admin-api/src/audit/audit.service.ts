import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

export interface AuditLogData {
  adminUserId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  actionDetails?: any;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: AuditLogData) {
    try {
      await this.prisma.adminAction.create({
        data: {
          adminUserId: data.adminUserId,
          actionType: data.actionType as any,
          resourceType: data.resourceType,
          resourceId: data.resourceId,
          actionDetails: data.actionDetails || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          reason: data.reason,
        },
      });
    } catch (error) {
      // Log audit failure but don't throw - audit shouldn't break business logic
      console.error('Failed to log audit action:', error);
    }
  }

  async getAuditLogs(options: {
    adminUserId?: string;
    actionType?: string;
    resourceType?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const {
      adminUserId,
      actionType,
      resourceType,
      resourceId,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = options;

    const where = {
      ...(adminUserId && { adminUserId }),
      ...(actionType && { actionType: actionType as any }),
      ...(resourceType && { resourceType }),
      ...(resourceId && { resourceId }),
      ...(startDate || endDate ? {
        timestamp: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      } : {}),
    };

    const [logs, total] = await Promise.all([
      this.prisma.adminAction.findMany({
        where,
        include: {
          adminUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.adminAction.count({ where }),
    ]);

    return {
      logs,
      total,
      limit,
      offset,
    };
  }

  async getAuditStats(options: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate } = options;

    const where = {
      ...(startDate || endDate ? {
        timestamp: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      } : {}),
    };

    const [
      totalActions,
      actionsByType,
      actionsByAdmin,
      recentActions,
    ] = await Promise.all([
      this.prisma.adminAction.count({ where }),

      this.prisma.adminAction.groupBy({
        by: ['actionType'],
        where,
        _count: { actionType: true },
        orderBy: { _count: { actionType: 'desc' } },
      }),

      this.prisma.adminAction.groupBy({
        by: ['adminUserId'],
        where,
        _count: { adminUserId: true },
        include: {
          adminUser: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { _count: { adminUserId: 'desc' } },
        take: 10,
      }),

      this.prisma.adminAction.findMany({
        where,
        include: {
          adminUser: {
            select: {
              email: true,
              role: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: 20,
      }),
    ]);

    return {
      totalActions,
      actionsByType: actionsByType.map(item => ({
        actionType: item.actionType,
        count: item._count.actionType,
      })),
      actionsByAdmin: actionsByAdmin.map(item => ({
        adminUser: item.adminUser,
        count: item._count.adminUserId,
      })),
      recentActions,
    };
  }

  // Helper method to get client IP from request
  getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection.remoteAddress ||
      request.socket.remoteAddress ||
      'unknown'
    );
  }
}
