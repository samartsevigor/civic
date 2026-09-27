import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateIssuesTable1730000000000 implements MigrationInterface {
  name = 'CreateIssuesTable1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "issues_category_enum" AS ENUM(
        'pothole', 'lighting', 'garbage', 'sidewalk', 'traffic_light', 'other'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "issues_status_enum" AS ENUM(
        'reported', 'in_progress', 'resolved', 'rejected'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "issues" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" text NOT NULL,
        "description" text,
        "category" "issues_category_enum" NOT NULL DEFAULT 'other',
        "status" "issues_status_enum" NOT NULL DEFAULT 'reported',
        "latitude" double precision NOT NULL,
        "longitude" double precision NOT NULL,
        "image_url" text,
        "confirmations" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_issues" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "issues"`);
    await queryRunner.query(`DROP TYPE "issues_status_enum"`);
    await queryRunner.query(`DROP TYPE "issues_category_enum"`);
  }
}
