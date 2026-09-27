import { config } from 'dotenv';
import dataSource from '../database/data-source';
import { Issue } from '../issues/issue.entity';
import { seedPhotoUrl } from './seed.data';

config({ path: '.env' });

async function fixSeedImages(): Promise<void> {
  await dataSource.initialize();

  const repo = dataSource.getRepository(Issue);
  const issues = await repo.find({ order: { created_at: 'ASC' } });

  let index = 1;
  for (const issue of issues) {
    const broken =
      !issue.image_url ||
      issue.image_url.includes('photo-1500000') ||
      issue.image_url.includes('images.unsplash.com/photo-1500');

    if (broken) {
      issue.image_url = seedPhotoUrl(index);
      await repo.save(issue);
    }
    index += 1;
  }

  console.log(`Checked ${issues.length} issues; placeholder URLs refreshed where needed.`);
  await dataSource.destroy();
}

fixSeedImages().catch((error) => {
  console.error(error);
  process.exit(1);
});
