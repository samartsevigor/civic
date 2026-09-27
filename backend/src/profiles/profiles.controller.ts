import { Body, Controller, Get, Headers, Post, BadRequestException } from '@nestjs/common';
import { SessionIdentityService } from '../auth/session-identity.service';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly identity: SessionIdentityService,
  ) {}

  @Get('me')
  async me(
    @Headers('x-device-id') deviceId?: string,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = await this.identity.resolve(authorization, deviceId);
    return this.profilesService.me(actor.identity, actor);
  }

  @Get('me/activity')
  async activity(
    @Headers('x-device-id') deviceId?: string,
    @Headers('authorization') authorization?: string,
  ) {
    const actor = await this.identity.resolve(authorization, deviceId);
    return this.profilesService.activity(actor.identity);
  }

  @Get('leaderboard')
  leaderboard() {
    return this.profilesService.leaderboard();
  }

  @Post('me')
  async upsert(
    @Headers('x-device-id') deviceId?: string,
    @Headers('authorization') authorization?: string,
    @Body('displayName') displayName?: string,
    @Body('showOnLeaderboard') showOnLeaderboard?: boolean,
  ) {
    const actor = await this.identity.resolve(authorization, deviceId);
    if (!actor.userId) {
      throw new BadRequestException('Sign in before saving a public profile');
    }
    if (!displayName?.trim()) {
      throw new BadRequestException('Display name is required');
    }
    return this.profilesService.upsert(
      actor.identity,
      displayName,
      showOnLeaderboard !== false,
    );
  }
}
