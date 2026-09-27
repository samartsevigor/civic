import { DataSourceOptions } from 'typeorm';
import { IssueConfirmation } from '../issues/issue-confirmation.entity';
import { IssueUpdate } from '../issues/issue-update.entity';
import { Issue } from '../issues/issue.entity';
import { CivicProfile } from '../profiles/civic-profile.entity';

function isSslEnabled(): boolean {
  return process.env.DATABASE_SSL_ENABLED === 'true';
}

export function buildDatabaseOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    username: process.env.DATABASE_USER ?? 'postgres',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: process.env.DATABASE_NAME ?? 'fixhack',
    ssl: isSslEnabled() ? { rejectUnauthorized: false } : false,
    entities: [Issue, IssueConfirmation, IssueUpdate, CivicProfile],
    synchronize: false,
  };
}

export function buildDataSourceOptions(): DataSourceOptions {
  return {
    ...buildDatabaseOptions(),
    migrations: ['src/database/migrations/*.ts'],
    migrationsTransactionMode: 'each',
  };
}
