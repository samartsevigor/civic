import { getMigrations } from 'better-auth/db/migration';
import { auth } from '../src/lib/auth';

async function main() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
  console.log('Better Auth tables are ready');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
