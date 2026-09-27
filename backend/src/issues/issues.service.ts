import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeocodeService } from '../geocode/geocode.service';
import { IssueCategory, IssueStatus, CATEGORY_LABELS } from './issue.enums';
import { IssueConfirmation } from './issue-confirmation.entity';
import { IssueUpdate } from './issue-update.entity';
import { Issue } from './issue.entity';
import { QueryIssuesDto } from './dto/query-issues.dto';

export interface CreateIssueInput {
  category: IssueCategory;
  latitude: number;
  longitude: number;
  description?: string;
  title?: string;
  address?: string;
  imageUrl?: string;
  fingerprint?: string;
  status?: IssueStatus;
}

export interface IssueStats {
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly issuesRepository: Repository<Issue>,
    @InjectRepository(IssueConfirmation)
    private readonly confirmationsRepository: Repository<IssueConfirmation>,
    @InjectRepository(IssueUpdate)
    private readonly updatesRepository: Repository<IssueUpdate>,
    private readonly geocodeService: GeocodeService,
  ) {}

  assertAdminForRejected(includeRejected: boolean | undefined, adminKey?: string): void {
    if (!includeRejected) return;

    const expected = process.env.ADMIN_API_KEY;
    if (!expected || adminKey !== expected) {
      throw new ForbiddenException('Admin API key required for rejected issues');
    }
  }

  async findAll(query: QueryIssuesDto, adminKey?: string): Promise<Issue[]> {
    this.assertAdminForRejected(query.includeRejected, adminKey);

    const qb = this.issuesRepository.createQueryBuilder('issue');

    if (query.category) {
      qb.andWhere('issue.category = :category', { category: query.category });
    }

    if (query.status) {
      qb.andWhere('issue.status = :status', { status: query.status });
    }

    if (!query.includeRejected) {
      qb.andWhere('issue.status NOT IN (:...hidden)', {
        hidden: [IssueStatus.REJECTED, IssueStatus.BLOCKED],
      });
    }

    qb.orderBy('issue.created_at', 'DESC');

    return qb.getMany();
  }

  async findNearby(
    latitude: number,
    longitude: number,
    category: IssueCategory,
    radiusMeters = 150,
  ): Promise<Issue[]> {
    const delta = radiusMeters / 111_000;

    return this.issuesRepository
      .createQueryBuilder('issue')
      .where('issue.category = :category', { category })
      .andWhere('issue.status NOT IN (:...hidden)', {
        hidden: [IssueStatus.REJECTED, IssueStatus.BLOCKED],
      })
      .andWhere('issue.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - delta,
        maxLat: latitude + delta,
      })
      .andWhere('issue.longitude BETWEEN :minLng AND :maxLng', {
        minLng: longitude - delta,
        maxLng: longitude + delta,
      })
      .orderBy('issue.created_at', 'DESC')
      .take(5)
      .getMany();
  }

  async getPublicSummary() {
    const issues = (await this.issuesRepository.find()).filter(
      (issue) => issue.status !== IssueStatus.BLOCKED,
    );
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const open = issues.filter((issue) =>
      [
        IssueStatus.REPORTED,
        IssueStatus.VERIFIED,
        IssueStatus.SENT_TO_ORG,
      ].includes(issue.status),
    ).length;
    const inProgress = issues.filter(
      (issue) => issue.status === IssueStatus.IN_PROGRESS,
    ).length;
    const resolvedThisMonth = issues.filter(
      (issue) =>
        issue.status === IssueStatus.RESOLVED &&
        new Date(issue.created_at) >= monthStart,
    ).length;

    return { open, inProgress, resolvedThisMonth, total: issues.length };
  }

  async listUpdates(issueId: string): Promise<IssueUpdate[]> {
    await this.findOne(issueId);
    return this.updatesRepository.find({
      where: { issue_id: issueId },
      order: { created_at: 'ASC' },
    });
  }

  async getStats(): Promise<IssueStats> {
    const issues = await this.issuesRepository.find();
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const issue of issues) {
      byStatus[issue.status] = (byStatus[issue.status] ?? 0) + 1;
      byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;
    }

    return { total: issues.length, byStatus, byCategory };
  }

  async findOne(id: string): Promise<Issue> {
    const issue = await this.load(id);
    if (issue.status === IssueStatus.BLOCKED) {
      throw new NotFoundException(`Issue ${id} not found`);
    }
    return issue;
  }

  private async load(id: string): Promise<Issue> {
    const issue = await this.issuesRepository.findOne({ where: { id } });
    if (!issue) {
      throw new NotFoundException(`Issue ${id} not found`);
    }
    return issue;
  }

  async create(input: CreateIssueInput): Promise<{
    issue: Issue;
    nearbyIssues: Issue[];
  }> {
    const label = CATEGORY_LABELS[input.category] ?? 'Issue';
    let place = input.address?.trim() || '';

    if (!place) {
      try {
        const geocoded = await this.geocodeService.reverseGeocode(
          input.latitude,
          input.longitude,
        );
        place = geocoded.display_name.split(',').slice(0, 2).join(',').trim();
      } catch {
        place = `${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`;
      }
    }

    const issue = this.issuesRepository.create({
      title: input.title?.trim() || `${label} near ${place}`,
      description: input.description ?? null,
      address: place,
      reporter_fingerprint: input.fingerprint ?? null,
      category: input.category,
      status: input.status ?? IssueStatus.REPORTED,
      latitude: input.latitude,
      longitude: input.longitude,
      image_url: input.imageUrl ?? null,
      confirmations: 0,
    });

    const saved = await this.issuesRepository.save(issue);

    const nearbyIssues = await this.findNearby(
      input.latitude,
      input.longitude,
      input.category,
    );

    return {
      issue: saved,
      nearbyIssues: nearbyIssues.filter((row) => row.id !== saved.id),
    };
  }

  async confirm(id: string, fingerprint: string): Promise<Issue> {
    if (!fingerprint?.trim()) {
      throw new ConflictException('Device fingerprint is required');
    }

    const issue = await this.load(id);
    if (issue.status === IssueStatus.BLOCKED) {
      throw new NotFoundException(`Issue ${id} not found`);
    }
    if (issue.reporter_fingerprint && issue.reporter_fingerprint === fingerprint) {
      throw new ConflictException('You cannot confirm your own report');
    }

    const existing = await this.confirmationsRepository.findOne({
      where: { issue_id: id, fingerprint },
    });

    if (existing) {
      throw new ConflictException('You already confirmed this issue');
    }

    await this.addConfirmation(id, fingerprint);
    return this.syncConfirmationCount(id);
  }

  async updateStatus(
    id: string,
    status: IssueStatus,
    publicNote?: string,
  ): Promise<Issue> {
    const issue = await this.load(id);
    const previous = issue.status;
    issue.status = status;
    const saved = await this.issuesRepository.save(issue);
    await this.updatesRepository.save(
      this.updatesRepository.create({
        issue_id: id,
        previous_status: previous,
        status,
        public_note: publicNote?.trim() || null,
      }),
    );
    return saved;
  }

  async remove(id: string): Promise<void> {
    const issue = await this.findOne(id);
    await this.issuesRepository.remove(issue);
  }

  private async addConfirmation(issueId: string, fingerprint: string): Promise<void> {
    const row = this.confirmationsRepository.create({
      issue_id: issueId,
      fingerprint,
    });
    await this.confirmationsRepository.save(row);
    await this.syncConfirmationCount(issueId);
  }

  private async syncConfirmationCount(issueId: string): Promise<Issue> {
    const count = await this.confirmationsRepository.count({
      where: { issue_id: issueId },
    });

    const issue = await this.findOne(issueId);
    issue.confirmations = count;
    return this.issuesRepository.save(issue);
  }
}
