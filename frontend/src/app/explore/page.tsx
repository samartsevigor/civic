'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CivicSelect } from '@/components/civic/CivicSelect';
import { IssueRow } from '@/components/civic/IssueRow';
import { LiveMap } from '@/components/civic/LiveMap';
import { getIssues } from '@/lib/api-client';
import { FILTERS, filterToCategory, issuePlace, type CivicFilter } from '@/lib/civic';
import type { Issue, IssueStatus } from '@/lib/types/issue';

export default function ExplorePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filter, setFilter] = useState<CivicFilter>('All');
  const [status, setStatus] = useState<'all' | IssueStatus>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    void getIssues({
      category: filterToCategory(filter),
      status: status === 'all' ? undefined : status,
    })
      .then(setIssues)
      .catch(() => setIssues([]));
  }, [filter, status]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return issues;
    return issues.filter((issue) =>
      `${issue.title} ${issuePlace(issue)} ${issue.description ?? ''}`
        .toLowerCase()
        .includes(needle),
    );
  }, [issues, query]);

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">EXPLORE REPORTS</div>
          <h1>What’s happening nearby</h1>
          <p>Browse recent issues by location, category and progress.</p>
        </div>
        <Link href="/report" className="btn">
          ＋ Report an issue
        </Link>
      </div>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search a street or issue"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search reports"
        />
        <CivicSelect
          ariaLabel="Filter category"
          value={filter}
          onValueChange={(next) => setFilter(next as CivicFilter)}
          options={FILTERS.map((item) => ({ value: item, label: item }))}
        />
        <CivicSelect
          ariaLabel="Filter status"
          value={status}
          onValueChange={(next) => setStatus(next as 'all' | IssueStatus)}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'reported', label: 'New' },
            { value: 'verified', label: 'Verified' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'resolved', label: 'Resolved' },
          ]}
        />
      </div>
      <div className="explore-grid">
        <div className="card explore-list">
          {visible.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
          {visible.length === 0 ? <div className="empty">No matching reports.</div> : null}
        </div>
        <LiveMap issues={visible} large />
      </div>
    </div>
  );
}
