import { config } from 'dotenv';
import dataSource from '../database/data-source';
import { Issue } from '../issues/issue.entity';
import { buildDesignSeed } from './seed.data';

config({ path: '.env' });

async function runSeed(): Promise<void> {
  await dataSource.initialize();
  await dataSource.runMigrations();

  await dataSource.query(
    'TRUNCATE TABLE "issue_updates", "issue_confirmations", "issues" RESTART IDENTITY CASCADE',
  );

  const issues = buildDesignSeed();
  await dataSource.getRepository(Issue).save(issues);
  console.log(`Seeded ${issues.length} design issues.`);
  await dataSource.destroy();
}

runSeed().catch((error) => {
  console.error(error);
  process.exit(1);
});
