import { IssueCategory, IssueStatus } from '../issues/issue.enums';

export interface SeedIssueRow {
  title: string;
  description: string;
  address: string;
  category: IssueCategory;
  status: IssueStatus;
  latitude: number;
  longitude: number;
  image_url: string;
  confirmations: number;
  created_at: Date;
}

export const seedPhotoUrl = (id: number) =>
  `https://picsum.photos/seed/fixmap-${id}/800/600`;

const STREETS = [
  'Queen St · Downtown',
  'Regent St · Downtown',
  'York St · Downtown',
  'King St · Downtown',
  'Brunswick St',
  'Westmorland St',
  'South Riverfront',
  'Officers’ Square',
];

const OPEN_STATUSES = [
  IssueStatus.REPORTED,
  IssueStatus.VERIFIED,
  IssueStatus.SENT_TO_ORG,
];

const CATEGORIES = [
  IssueCategory.POTHOLE,
  IssueCategory.GARBAGE,
  IssueCategory.LIGHTING,
  IssueCategory.SIDEWALK,
  IssueCategory.TRAFFIC_LIGHT,
  IssueCategory.OTHER,
];

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

function featured(): SeedIssueRow[] {
  return [
    {
      title: 'Pothole on Queen Street',
      description:
        'A large pothole in the eastbound lane near the intersection. Drivers are swerving around it, especially after rain.',
      address: 'Queen St · Downtown',
      category: IssueCategory.POTHOLE,
      status: IssueStatus.VERIFIED,
      latitude: 45.9639,
      longitude: -66.6438,
      image_url: seedPhotoUrl(1),
      confirmations: 18,
      created_at: hoursAgo(2),
    },
    {
      title: 'Overflowing bin near Officers’ Square',
      description:
        'The public waste bin has been full for several days and litter is spreading along the path.',
      address: 'Queen St · Downtown',
      category: IssueCategory.GARBAGE,
      status: IssueStatus.IN_PROGRESS,
      latitude: 45.9632,
      longitude: -66.6445,
      image_url: seedPhotoUrl(2),
      confirmations: 12,
      created_at: hoursAgo(5),
    },
    {
      title: 'Streetlight out on Regent Street',
      description:
        'The streetlight at the corner does not turn on after dark. The crosswalk is hard to see.',
      address: 'Regent St · Downtown',
      category: IssueCategory.LIGHTING,
      status: IssueStatus.REPORTED,
      latitude: 45.9628,
      longitude: -66.6412,
      image_url: seedPhotoUrl(3),
      confirmations: 9,
      created_at: hoursAgo(26),
    },
    {
      title: 'Damaged sidewalk by City Hall',
      description: 'Raised paving stones create a trip hazard beside the main entrance.',
      address: 'Queen St · Downtown',
      category: IssueCategory.SIDEWALK,
      status: IssueStatus.VERIFIED,
      latitude: 45.963,
      longitude: -66.643,
      image_url: seedPhotoUrl(4),
      confirmations: 15,
      created_at: hoursAgo(30),
    },
    {
      title: 'Litter along the river trail',
      description: 'Plastic packaging and bottles collected along the trail entrance.',
      address: 'South Riverfront',
      category: IssueCategory.GARBAGE,
      status: IssueStatus.RESOLVED,
      latitude: 45.9615,
      longitude: -66.64,
      image_url: seedPhotoUrl(5),
      confirmations: 7,
      created_at: hoursAgo(48),
    },
  ];
}

function extra(startId: number, count: number, status: IssueStatus): SeedIssueRow[] {
  return Array.from({ length: count }, (_, index) => {
    const id = startId + index;
    const category = CATEGORIES[id % CATEGORIES.length];
    const street = STREETS[id % STREETS.length];
    return {
      title: `${category.replace('_', ' ')} on ${street.split(' · ')[0]} #${id}`,
      description: 'Community report near downtown Fredericton.',
      address: street,
      category,
      status,
      latitude: 45.9608 + (id % 17) * 0.00045,
      longitude: -66.646 + (id % 13) * 0.00042,
      image_url: seedPhotoUrl(id),
      confirmations: 2 + (id % 16),
      created_at: hoursAgo(40 + id),
    };
  });
}

export function buildDesignSeed(): SeedIssueRow[] {
  const hero = featured();
  const openLeft = 42 - hero.filter((row) => OPEN_STATUSES.includes(row.status)).length;
  const progressLeft =
    18 - hero.filter((row) => row.status === IssueStatus.IN_PROGRESS).length;
  const resolvedLeft =
    126 - hero.filter((row) => row.status === IssueStatus.RESOLVED).length;

  return [
    ...hero,
    ...extra(10, openLeft, IssueStatus.REPORTED).map((row, index) => ({
      ...row,
      status: OPEN_STATUSES[index % OPEN_STATUSES.length],
    })),
    ...extra(100, progressLeft, IssueStatus.IN_PROGRESS),
    ...extra(200, resolvedLeft, IssueStatus.RESOLVED),
  ];
}
