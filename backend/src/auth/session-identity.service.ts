import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type Actor = {
  identity: string;
  userId: string | null;
  name: string | null;
  email: string | null;
};

@Injectable()
export class SessionIdentityService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async resolve(authorization?: string, deviceId?: string): Promise<Actor> {
    const token = authorization?.replace(/^Bearer\s+/i, '').trim();
    if (token) {
      const account = await this.accountForToken(token);
      if (account) {
        return {
          identity: `user:${account.id}`,
          userId: account.id,
          name: account.name,
          email: account.email,
        };
      }
    }

    return {
      identity: deviceId?.trim() || 'guest',
      userId: null,
      name: null,
      email: null,
    };
  }

  private async accountForToken(token: string): Promise<{ id: string; name: string | null; email: string | null } | null> {
    try {
      const rows = await this.dataSource.query(
        `SELECT u.id, u.name, u.email
         FROM "session" s
         JOIN "user" u ON u.id = s."userId"
         WHERE s.token = $1 AND s."expiresAt" > NOW()
         LIMIT 1`,
        [token],
      );
      return rows[0] ?? null;
    } catch {
      return null;
    }
  }
}
