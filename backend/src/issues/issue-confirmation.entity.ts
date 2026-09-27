import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Issue } from './issue.entity';

@Entity('issue_confirmations')
@Unique(['issue_id', 'fingerprint'])
@Index(['issue_id'])
export class IssueConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  issue_id: string;

  @ManyToOne(() => Issue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'issue_id' })
  issue: Issue;

  @Column({ type: 'varchar', length: 128 })
  fingerprint: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
