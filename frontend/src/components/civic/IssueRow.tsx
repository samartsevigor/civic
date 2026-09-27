'use client';

import Link from 'next/link';
import type { Issue } from '@/lib/types/issue';
import { CATEGORY_META, issueMeta, publicStatusLabel, statusBadgeClass } from '@/lib/civic';

export function IssueRow({ issue }: { issue: Issue }) {
  const meta = CATEGORY_META[issue.category];
  return (
    <Link href={`/issue/${issue.id}`} className="issue-row">
      <span className={`issue-icon ${meta.className}`}>{meta.icon}</span>
      <span className="issue-body">
        <strong>{issue.title}</strong>
        <span className="issue-meta">{issueMeta(issue)}</span>
      </span>
      <span className={`badge ${statusBadgeClass(issue.status)}`}>
        {publicStatusLabel(issue.status)}
      </span>
    </Link>
  );
}
