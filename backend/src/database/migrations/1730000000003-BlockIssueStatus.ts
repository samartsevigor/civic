import { MigrationInterface, QueryRunner } from 'typeorm';

export class BlockIssueStatus1730000000003 implements MigrationInterface {
  name = 'BlockIssueStatus1730000000003';
  transaction = false;

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "issues_status_enum" ADD VALUE IF NOT EXISTS 'blocked'`,
    );
  }

  public async down(): Promise<void> {
    return Promise.resolve();
  }
}
