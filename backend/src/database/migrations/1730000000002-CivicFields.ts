import { MigrationInterface, QueryRunner } from 'typeorm';

export class CivicFields1730000000002 implements MigrationInterface {
  name = 'CivicFields1730000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "address" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "issues" ADD COLUMN IF NOT EXISTS "reporter_fingerprint" varchar(128)`,
    );
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "issue_updates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "issue_id" uuid NOT NULL,
        "previous_status" varchar(32),
        "status" varchar(32) NOT NULL,
        "public_note" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_issue_updates" PRIMARY KEY ("id"),
        CONSTRAINT "FK_issue_updates_issue" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "civic_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "fingerprint" varchar(128) NOT NULL,
        "display_name" varchar(40) NOT NULL,
        "show_on_leaderboard" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_civic_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_civic_profiles_fingerprint" UNIQUE ("fingerprint")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "civic_profiles"`);
    await queryRunner.query(`DROP TABLE "issue_updates"`);
    await queryRunner.query(
      `ALTER TABLE "issues" DROP COLUMN "reporter_fingerprint"`,
    );
    await queryRunner.query(`ALTER TABLE "issues" DROP COLUMN "address"`);
  }
}
