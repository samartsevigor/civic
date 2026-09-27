import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AdminApiKeyGuard } from '../auth/admin-api-key.guard';
import { SessionIdentityService } from '../auth/session-identity.service';
import { ImageModerationService } from '../moderation/image-moderation.service';
import { imageFileFilter, optimizeUploadedImage } from '../upload/image.processor';
import { createIssuePhotoStorage, resolveUploadRoot } from '../upload/upload.storage';
import { IssueCategory, IssueStatus } from './issue.enums';
import { UpdateIssueStatusDto } from './dto/update-issue-status.dto';
import { QueryIssuesDto } from './dto/query-issues.dto';
import { IssuesService } from './issues.service';

@ApiTags('issues')
@Controller('issues')
export class IssuesController {
  constructor(
    private readonly issuesService: IssuesService,
    private readonly identity: SessionIdentityService,
    private readonly moderation: ImageModerationService,
    configService: ConfigService,
  ) {
    const configured = configService.get<string>('UPLOAD_DIR');
    if (configured) {
      process.env.UPLOAD_DIR = configured;
    }
  }

  @Get('meta/summary')
  getPublicSummary() {
    return this.issuesService.getPublicSummary();
  }

  @Get(':id/updates')
  listUpdates(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.listUpdates(id);
  }

  @Get('meta/stats')
  @UseGuards(AdminApiKeyGuard)
  getStats() {
    return this.issuesService.getStats();
  }

  @Get('nearby')
  findNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('category') category: IssueCategory,
    @Query('radius') radius?: string,
  ) {
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng) || !category) {
      throw new BadRequestException('latitude, longitude and category are required');
    }

    return this.issuesService.findNearby(
      lat,
      lng,
      category,
      radius ? Number(radius) : 150,
    );
  }

  @Get()
  findAll(
    @Query() query: QueryIssuesDto,
    @Headers('x-admin-key') adminKey?: string,
  ) {
    return this.issuesService.findAll(query, adminKey);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.issuesService.findOne(id);
  }

  @Post()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createIssuePhotoStorage(resolveUploadRoot()),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('category') category: IssueCategory,
    @Body('latitude') latitude: string,
    @Body('longitude') longitude: string,
    @Body('description') description?: string,
    @Body('title') title?: string,
    @Body('address') address?: string,
    @Headers('x-device-id') deviceId?: string,
    @Headers('authorization') authorization?: string,
  ) {
    if (!category || !Object.values(IssueCategory).includes(category)) {
      throw new BadRequestException('Valid category is required');
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      throw new BadRequestException('Valid latitude and longitude are required');
    }

    if (!file) {
      throw new BadRequestException('A photo is required');
    }

    let imageUrl: string;
    let storedPath: string;
    try {
      const storedName = await optimizeUploadedImage(resolveUploadRoot(), file.filename);
      storedPath = join(resolveUploadRoot(), storedName);
      imageUrl = `/uploads/issue-photos/${storedName}`;
    } catch {
      throw new BadRequestException('Could not process this photo. Try a different image.');
    }

    // Snowflake Cortex AI_FILTER is off on this trial until a card is added.
    // Keep the check in place and flip this when the account can run it.
    const photoCheckEnabled = false;
    let explicit = false;
    if (photoCheckEnabled) {
      try {
        explicit = await this.moderation.containsExplicitContent(storedPath);
      } catch (error) {
        const detail = error instanceof Error ? error.message : '';
        if (detail.includes('Network policy')) {
          throw new BadRequestException(
            'Photo check is waiting for a Snowflake network policy. Add it in the SQL worksheet, then try again.',
          );
        }
        if (detail.includes('not available for trial')) {
          throw new BadRequestException(
            'Snowflake trial has photo checks turned off until a card is added to the account.',
          );
        }
        throw new BadRequestException('Could not check this photo. Try again in a moment.');
      }
    }

    const actor = await this.identity.resolve(authorization, deviceId);
    return this.issuesService.create({
      category,
      latitude: lat,
      longitude: lng,
      description,
      title,
      address,
      imageUrl,
      fingerprint: actor.identity,
      status: explicit ? IssueStatus.BLOCKED : IssueStatus.REPORTED,
    });
  }

  @Patch(':id/confirm')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiHeader({ name: 'X-Device-Id', required: true })
  async confirm(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-device-id') deviceId?: string,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = await this.identity.resolve(authorization, deviceId);
    return this.issuesService.confirm(id, actor.identity);
  }

  @Patch(':id/status')
  @UseGuards(AdminApiKeyGuard)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIssueStatusDto,
  ) {
    return this.issuesService.updateStatus(id, dto.status, dto.publicNote);
  }

  @Delete(':id')
  @UseGuards(AdminApiKeyGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.issuesService.remove(id);
    return { deleted: true };
  }
}
