import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnhanceIssuesWorkflow1730000000001 implements MigrationInterface {
  name = 'EnhanceIssuesWorkflow1730000000001';
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "issues_status_enum" ADD VALUE IF NOT EXISTS 'verified'`,
    );
    await queryRunner.query(
      `ALTER TYPE "issues_status_enum" ADD VALUE IF NOT EXISTS 'sent_to_org'`,
    );

    await queryRunner.query(`
      CREATE TABLE "issue_confirmations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "issue_id" uuid NOT NULL,
        "fingerprint" varchar(128) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_issue_confirmations" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_issue_confirmations_issue_fingerprint" UNIQUE ("issue_id", "fingerprint"),
        CONSTRAINT "FK_issue_confirmations_issue" FOREIGN KEY ("issue_id") REFERENCES "issues"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_issues_category_status" ON "issues" ("category", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_issues_lat_lng" ON "issues" ("latitude", "longitude")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_issue_confirmations_issue_id" ON "issue_confirmations" ("issue_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_issue_confirmations_issue_id"`);
    await queryRunner.query(`DROP INDEX "IDX_issues_lat_lng"`);
    await queryRunner.query(`DROP INDEX "IDX_issues_category_status"`);
    await queryRunner.query(`DROP TABLE "issue_confirmations"`);
  }
}
