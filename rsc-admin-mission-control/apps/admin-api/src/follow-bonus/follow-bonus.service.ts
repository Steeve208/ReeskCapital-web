import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuditService } from '../audit/audit.service';

export interface FollowBonusFilter {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface FollowBonusStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  rejectionRate: number;
  averageProofs: number;
  lastSubmission?: Date;
}

@Injectable()
export class FollowBonusService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getQueue(filter: FollowBonusFilter = {}, pagination: { page: number; pageSize: number } = { page: 1, pageSize: 20 }) {
    const { status, startDate, endDate, search } = filter;
    const { page, pageSize } = pagination;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { xHandle: { contains: search, mode: 'insensitive' } },
        { walletAddress: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [requests, total] = await Promise.all([
      this.prisma.followBonusRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              balance: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.followBonusRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getStats(filter: FollowBonusFilter = {}): Promise<FollowBonusStats> {
    const { startDate, endDate } = filter;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      total,
      pending,
      approved,
      rejected,
      attachmentsData,
      lastSubmission,
    ] = await Promise.all([
      this.prisma.followBonusRequest.count({ where }),
      this.prisma.followBonusRequest.count({ where: { ...where, status: 'PENDING' } }),
      this.prisma.followBonusRequest.count({ where: { ...where, status: 'APPROVED' } }),
      this.prisma.followBonusRequest.count({ where: { ...where, status: 'REJECTED' } }),
      this.prisma.followBonusRequest.findMany({
        where,
        select: { attachments: true },
      }),
      this.prisma.followBonusRequest.findFirst({
        where,
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    // Calculate average proofs
    const totalAttachments = attachmentsData.reduce((sum, req) => {
      const attachments = Array.isArray(req.attachments) ? req.attachments : [];
      return sum + attachments.length;
    }, 0);

    const averageProofs = total > 0 ? totalAttachments / total : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
      rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
      averageProofs: Math.round(averageProofs * 10) / 10,
      lastSubmission: lastSubmission?.createdAt,
    };
  }

  async approveRequest(requestId: string, adminUserId: string, notes?: string) {
    const request = await this.prisma.followBonusRequest.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!request) {
      throw new NotFoundException('Follow bonus request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not in pending status');
    }

    // Update request status
    const updatedRequest = await this.prisma.followBonusRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            balance: true,
          },
        },
      },
    });

    // Create bonus record
    if (request.userId) {
      await this.prisma.bonus.create({
        data: {
          userId: request.userId,
          bonusType: 'follow_bonus',
          amount: request.amount,
          reason: 'Follow & Earn 100 RSK manual approval',
          isClaimed: true,
          followBonusRequestId: requestId,
        },
      });

      // Update user balance
      await this.prisma.user.update({
        where: { id: request.userId },
        data: {
          balance: {
            increment: request.amount,
          },
        },
      });
    }

    // Audit log
    await this.auditService.logAction({
      adminUserId,
      actionType: 'APPROVE',
      resourceType: 'follow_bonus_request',
      resourceId: requestId,
      actionDetails: {
        oldStatus: request.status,
        newStatus: 'APPROVED',
        amount: request.amount,
        userId: request.userId,
        notes,
      },
    });

    return updatedRequest;
  }

  async rejectRequest(requestId: string, adminUserId: string, notes: string) {
    const request = await this.prisma.followBonusRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Follow bonus request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request is not in pending status');
    }

    if (!notes || notes.trim().length === 0) {
      throw new BadRequestException('Rejection reason is required');
    }

    const updatedRequest = await this.prisma.followBonusRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminUserId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            balance: true,
          },
        },
      },
    });

    // Audit log
    await this.auditService.logAction({
      adminUserId,
      actionType: 'REJECT',
      resourceType: 'follow_bonus_request',
      resourceId: requestId,
      actionDetails: {
        oldStatus: request.status,
        newStatus: 'REJECTED',
        userId: request.userId,
        notes,
      },
    });

    return updatedRequest;
  }

  async bulkAction(requestIds: string[], action: 'approve' | 'reject', adminUserId: string, notes?: string) {
    const results = [];
    const errors = [];

    for (const requestId of requestIds) {
      try {
        if (action === 'approve') {
          const result = await this.approveRequest(requestId, adminUserId, notes);
          results.push(result);
        } else {
          if (!notes) {
            errors.push({ requestId, error: 'Rejection notes required for bulk rejection' });
            continue;
          }
          const result = await this.rejectRequest(requestId, adminUserId, notes);
          results.push(result);
        }
      } catch (error) {
        errors.push({ requestId, error: error.message });
      }
    }

    return {
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  async exportToCSV(filter: FollowBonusFilter = {}): Promise<string> {
    const { requests } = await this.getQueue(filter, { page: 1, pageSize: 10000 });

    const headers = [
      'ID',
      'Created At',
      'Full Name',
      'Contact Email',
      'X Handle',
      'Telegram Username',
      'Wallet Address',
      'Status',
      'Attachments Count',
      'Amount',
      'Reviewed By',
      'Reviewed At',
      'Review Notes',
    ];

    const rows = requests.map(request => [
      request.id,
      request.createdAt.toISOString(),
      request.fullName,
      request.contactEmail,
      request.xHandle,
      request.telegramUsername || '',
      request.walletAddress,
      request.status,
      Array.isArray(request.attachments) ? request.attachments.length.toString() : '0',
      request.amount.toString(),
      request.reviewedBy || '',
      request.reviewedAt?.toISOString() || '',
      request.reviewNotes || '',
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
