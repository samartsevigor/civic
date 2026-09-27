import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('civic_profiles')
export class CivicProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 128, unique: true })
  fingerprint: string;

  @Column({ type: 'varchar', length: 40 })
  display_name: string;

  @Column({ type: 'boolean', default: true })
  show_on_leaderboard: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
