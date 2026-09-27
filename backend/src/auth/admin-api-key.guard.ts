import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header('x-admin-key');
    const expected = this.configService.get<string>('ADMIN_API_KEY');

    if (!expected || provided !== expected) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    return true;
  }
}
