import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IssueStatus } from './issue.enums';
import { Issue } from './issue.entity';

@Entity('issue_updates')
@Index(['issue_id'])
export class IssueUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  issue_id: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  @Column({ type: 'varchar', length: 32, nullable: true })
  previous_status: IssueStatus | null;

  @Column({ type: 'varchar', length: 32 })
  status: IssueStatus;

  @Column({ type: 'text', nullable: true })
  public_note: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
