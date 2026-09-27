import { Injectable, Logger } from '@nestjs/common';
import { basename } from 'path';
import * as snowflake from 'snowflake-sdk';

type SnowflakeConnection = ReturnType<typeof snowflake.createConnection>;

@Injectable()
export class ImageModerationService {
  private readonly logger = new Logger(ImageModerationService.name);

  async containsExplicitContent(absolutePath: string): Promise<boolean> {
    const connection = await this.connect();
    try {
      const stage = process.env.SNOWFLAKE_STAGE ?? 'ISSUE_PHOTOS';
      const filename = basename(absolutePath);
      const fileUrl = absolutePath.replace(/\\/g, '/');
      await this.execute(
        connection,
        `PUT 'file://${fileUrl}' @${stage} AUTO_COMPRESS=FALSE OVERWRITE=TRUE`,
      );
      const rows = await this.execute<{ IS_EXPLICIT: boolean | string }>(
        connection,
        `SELECT AI_FILTER(
          'Does this image contain pornography, nudity, or explicit adult content?',
          TO_FILE('@${stage}/${filename}')
        ) AS is_explicit`,
      );
      const value = rows[0]?.IS_EXPLICIT;
      return value === true || String(value).toUpperCase() === 'TRUE';
    } finally {
      connection.destroy(() => undefined);
    }
  }

  private connect(): Promise<SnowflakeConnection> {
    snowflake.configure({ logLevel: 'ERROR' });
    const connection = snowflake.createConnection({
      account: requiredEnv('SNOWFLAKE_ACCOUNT'),
      username: requiredEnv('SNOWFLAKE_USER'),
      password: requiredEnv('SNOWFLAKE_PASSWORD'),
      authenticator: 'PROGRAMMATIC_ACCESS_TOKEN',
      warehouse: requiredEnv('SNOWFLAKE_WAREHOUSE'),
      database: requiredEnv('SNOWFLAKE_DATABASE'),
      schema: requiredEnv('SNOWFLAKE_SCHEMA'),
      role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
    });

    return new Promise((resolve, reject) => {
      connection.connect((error, connected) => {
        if (error || !connected) {
          this.logger.error(error?.message ?? 'Snowflake connection failed');
          reject(error ?? new Error('Snowflake connection failed'));
          return;
        }
        resolve(connected);
      });
    });
  }

  private execute<T>(connection: SnowflakeConnection, sqlText: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      connection.execute({
        sqlText,
        complete: (error, _statement, rows) => {
          if (error) {
            this.logger.error(error.message);
            reject(error);
            return;
          }
          resolve((rows ?? []) as T[]);
        },
      });
    });
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}
