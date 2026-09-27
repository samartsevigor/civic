import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionIdentityService } from '../auth/session-identity.service';
import { IssueConfirmation } from '../issues/issue-confirmation.entity';
import { Issue } from '../issues/issue.entity';
import { CivicProfile } from './civic-profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [TypeOrmModule.forFeature([CivicProfile, Issue, IssueConfirmation])],
  controllers: [ProfilesController],
  providers: [ProfilesService, SessionIdentityService],
})
export class ProfilesModule {}
