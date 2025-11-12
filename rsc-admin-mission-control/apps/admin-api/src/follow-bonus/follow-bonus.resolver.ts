import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FollowBonusService, FollowBonusFilter } from './follow-bonus.service';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentAdmin } from '../auth/decorators/current-admin.decorator';
import { AdminUserPayload } from '../auth/auth.service';

@Resolver()
@UseGuards(AdminGuard)
export class FollowBonusResolver {
  constructor(private readonly followBonusService: FollowBonusService) {}

  @Query(() => FollowBonusQueueResponse)
  async followBonusQueue(
    @Args('filter', { nullable: true }) filter: FollowBonusFilter,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('pageSize', { type: () => Int, defaultValue: 20 }) pageSize: number,
  ) {
    return this.followBonusService.getQueue(filter, { page, pageSize });
  }

  @Query(() => FollowBonusStatsResponse)
  async followBonusStats(
    @Args('filter', { nullable: true }) filter: FollowBonusFilter,
  ) {
    const stats = await this.followBonusService.getStats(filter);
    return stats;
  }

  @Mutation(() => FollowBonusRequestResponse)
  async approveFollowBonusRequest(
    @Args('requestId') requestId: string,
    @Args('notes', { nullable: true }) notes: string,
    @CurrentAdmin() admin: AdminUserPayload,
  ) {
    return this.followBonusService.approveRequest(requestId, admin.id, notes);
  }

  @Mutation(() => FollowBonusRequestResponse)
  async rejectFollowBonusRequest(
    @Args('requestId') requestId: string,
    @Args('notes') notes: string,
    @CurrentAdmin() admin: AdminUserPayload,
  ) {
    return this.followBonusService.rejectRequest(requestId, admin.id, notes);
  }

  @Mutation(() => BulkActionResponse)
  async bulkFollowBonusAction(
    @Args('requestIds', { type: () => [String] }) requestIds: string[],
    @Args('action') action: string,
    @Args('notes', { nullable: true }) notes: string,
    @CurrentAdmin() admin: AdminUserPayload,
  ) {
    if (!['approve', 'reject'].includes(action)) {
      throw new Error('Invalid action. Must be "approve" or "reject"');
    }

    return this.followBonusService.bulkAction(
      requestIds,
      action as 'approve' | 'reject',
      admin.id,
      notes,
    );
  }

  @Query(() => String)
  async exportFollowBonusCSV(
    @Args('filter', { nullable: true }) filter: FollowBonusFilter,
    @CurrentAdmin() admin: AdminUserPayload,
  ) {
    return this.followBonusService.exportToCSV(filter);
  }
}

// GraphQL Types
import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class FollowBonusRequest {
  @Field()
  id: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  fullName: string;

  @Field()
  contactEmail: string;

  @Field()
  xHandle: string;

  @Field({ nullable: true })
  telegramUsername?: string;

  @Field()
  walletAddress: string;

  @Field()
  status: string;

  @Field(() => [String])
  attachments: string[];

  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  reviewedBy?: string;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field({ nullable: true })
  reviewNotes?: string;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  user?: any;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class FollowBonusQueueResponse {
  @Field(() => [FollowBonusRequest])
  requests: FollowBonusRequest[];

  @Field(() => PaginationInfo)
  pagination: PaginationInfo;
}

@ObjectType()
export class FollowBonusStatsResponse {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  pending: number;

  @Field(() => Int)
  approved: number;

  @Field(() => Int)
  rejected: number;

  @Field(() => Float)
  approvalRate: number;

  @Field(() => Float)
  rejectionRate: number;

  @Field(() => Float)
  averageProofs: number;

  @Field({ nullable: true })
  lastSubmission?: Date;
}

@ObjectType()
export class FollowBonusRequestResponse {
  @Field()
  id: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field({ nullable: true })
  reviewNotes?: string;
}

@ObjectType()
export class BulkActionResult {
  @Field()
  requestId: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class BulkActionResponse {
  @Field(() => Int)
  successful: number;

  @Field(() => Int)
  failed: number;

  @Field(() => [FollowBonusRequest])
  results: FollowBonusRequest[];

  @Field(() => [BulkActionResult])
  errors: BulkActionResult[];
}
