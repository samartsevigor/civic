import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssueStatus } from '../issues/issue.enums';
import { IssueConfirmation } from '../issues/issue-confirmation.entity';
import { Issue } from '../issues/issue.entity';
import { CivicProfile } from './civic-profile.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(CivicProfile)
    private readonly profiles: Repository<CivicProfile>,
    @InjectRepository(Issue)
    private readonly issues: Repository<Issue>,
    @InjectRepository(IssueConfirmation)
    private readonly confirmations: Repository<IssueConfirmation>,
  ) {}

  async upsert(fingerprint: string, displayName: string, showOnLeaderboard: boolean) {
    const existing = await this.profiles.findOne({ where: { fingerprint } });
    if (existing) {
      existing.display_name = displayName.trim().slice(0, 40);
      existing.show_on_leaderboard = showOnLeaderboard;
      return this.profiles.save(existing);
    }

    return this.profiles.save(
      this.profiles.create({
        fingerprint,
        display_name: displayName.trim().slice(0, 40),
        show_on_leaderboard: showOnLeaderboard,
      }),
    );
  }

  async me(
    fingerprint: string,
    account?: { userId: string | null; name: string | null; email: string | null },
  ) {
    let profile = await this.profiles.findOne({ where: { fingerprint } });
    if (!profile && account?.userId) {
      const label = account.name?.trim() || account.email?.split('@')[0] || 'Neighbour';
      profile = await this.upsert(fingerprint, label, false);
    }
    const stats = await this.statsFor(fingerprint);
    return { profile, stats, email: account?.email ?? null };
  }

  async activity(fingerprint: string) {
    const reports = await this.issues.find({
      where: { reporter_fingerprint: fingerprint },
      order: { created_at: 'DESC' },
      take: 20,
    });
    return reports;
  }

  async leaderboard() {
    const profiles = await this.profiles.find({
      where: { show_on_leaderboard: true },
    });

    const rows = await Promise.all(
      profiles.map(async (profile) => {
        const stats = await this.statsFor(profile.fingerprint);
        return {
          displayName: profile.display_name,
          points: stats.points,
          fingerprint: profile.fingerprint,
        };
      }),
    );

    return rows
      .sort((a, b) => b.points - a.points)
      .slice(0, 10)
      .map(({ displayName, points }) => ({ displayName, points }));
  }

  private async statsFor(fingerprint: string) {
    const reports = await this.issues.find({
      where: { reporter_fingerprint: fingerprint },
    });
    const confirmations = await this.confirmations.count({
      where: { fingerprint },
    });
    const resolved = reports.filter(
      (issue) => issue.status === IssueStatus.RESOLVED,
    ).length;
    const points = reports.length * 10 + confirmations * 5 + resolved * 20;

    return {
      reports: reports.length,
      confirmations,
      resolved,
      points,
    };
  }
}
