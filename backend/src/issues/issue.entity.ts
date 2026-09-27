import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IssueCategory, IssueStatus } from './issue.enums';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: IssueCategory,
    default: IssueCategory.OTHER,
  })
  category: IssueCategory;

  @Column({
    type: 'enum',
    enum: IssueStatus,
    default: IssueStatus.REPORTED,
  })
  status: IssueStatus;

  @Column({ type: 'double precision' })
  latitude: number;

  @Column({ type: 'double precision' })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  reporter_fingerprint: string | null;

  @Column({ type: 'text', nullable: true })
  image_url: string | null;

  @Column({ type: 'int', default: 1 })
  confirmations: number;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
