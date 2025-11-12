import { Module } from '@nestjs/common';
import { FollowBonusService } from './follow-bonus.service';
import { FollowBonusResolver } from './follow-bonus.resolver';
import { DatabaseModule } from '../database/database.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DatabaseModule, AuditModule],
  providers: [FollowBonusService, FollowBonusResolver],
  exports: [FollowBonusService],
})
export class FollowBonusModule {}
