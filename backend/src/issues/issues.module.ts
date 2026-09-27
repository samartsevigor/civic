import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { SessionIdentityService } from '../auth/session-identity.service';
import { GeocodeModule } from '../geocode/geocode.module';
import { ImageModerationService } from '../moderation/image-moderation.service';
import { IssueConfirmation } from './issue-confirmation.entity';
import { IssueUpdate } from './issue-update.entity';
import { Issue } from './issue.entity';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Issue, IssueConfirmation, IssueUpdate]),
    GeocodeModule,
  ],
  controllers: [IssuesController],
  providers: [IssuesService, AdminApiKeyGuard, SessionIdentityService, ImageModerationService],
  exports: [IssuesService],
})
export class IssuesModule {}
