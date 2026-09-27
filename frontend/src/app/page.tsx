'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IssueRow } from '@/components/civic/IssueRow';
import { LiveMap } from '@/components/civic/LiveMap';
import { getIssues, getPublicSummary, type PublicSummary } from '@/lib/api-client';
import { FILTERS, filterToCategory, type CivicFilter } from '@/lib/civic';
import type { Issue } from '@/lib/types/issue';

const HeroBackdrop = dynamic(
  () => import('@/components/civic/HeroBackdrop').then((mod) => mod.HeroBackdrop),
  { ssr: false },
);

export default function OverviewPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [summary, setSummary] = useState<PublicSummary | null>(null);
  const [filter, setFilter] = useState<CivicFilter>('All');

  useEffect(() => {
    void getPublicSummary().then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    void getIssues({ category: filterToCategory(filter) })
      .then(setIssues)
      .catch(() => setIssues([]));
  }, [filter]);

  const featured = issues[0];

  return (
    <div className="content home-content">
      <section className="hero" aria-label="Report and track city issues">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="hero-pulse" /> A BETTER FREDERICTON STARTS WITH YOU
          </div>
          <h1>
            See a problem?
            <br />
            <em>Let’s fix it.</em>
          </h1>
          <p>
            Report potholes, litter, broken lights and more. Neighbours confirm what they see.
            City staff share what happens next.
          </p>
          <div className="hero-actions">
            <Link href="/report" className="hero-primary">
              ＋ &nbsp; Report a problem <span>↗</span>
            </Link>
            <Link href="/explore" className="hero-secondary">
              Explore reports <span>→</span>
            </Link>
          </div>
          <div className="hero-flow">
            <span>
              <b>01</b> Report it
            </span>
            <i />
            <span>
              <b>02</b> Neighbours confirm
            </span>
            <i />
            <span>
              <b>03</b> Track progress
            </span>
          </div>
        </div>
        <div className="hero-scene">
          <div className="hero-map">
            <HeroBackdrop />
            <span className="hero-grid" />
          </div>
          <div className="hero-location">⌖ &nbsp; DOWNTOWN FREDERICTON</div>
          {featured ? (
            <Link href={`/issue/${featured.id}`} className="hero-report-card">
              <div className="hero-report-top">
                <span className="hero-report-icon">⌁</span>
                <span className="badge verified">LIVE REPORT</span>
              </div>
              <strong>{featured.title}</strong>
              <small>{featured.confirmations} neighbours confirmed this issue</small>
              <div className="hero-card-line">
                <span>Reported</span>
                <span>Verified</span>
                <span>City review</span>
              </div>
              <div className="hero-progress">
                <i />
              </div>
            </Link>
          ) : null}
          <div className="hero-float">✳ &nbsp; REAL ISSUES. VISIBLE PROGRESS.</div>
        </div>
      </section>

      <div className="impact-bar">
        <div>
          <strong>{summary?.open ?? '—'}</strong>
          <span>open reports</span>
        </div>
        <div>
          <strong>{summary?.inProgress ?? '—'}</strong>
          <span>being worked on</span>
        </div>
        <div>
          <strong>{summary?.resolvedThisMonth ?? '—'}</strong>
          <span>resolved this month</span>
        </div>
        <Link href="/explore">
          See what’s happening <span>↗</span>
        </Link>
      </div>

      <div className="home-section-heading">
        <div>
          <div className="eyebrow">THE COMMUNITY IS ON IT</div>
          <h2>Issues around you</h2>
          <p>Real reports from streets and spaces near downtown.</p>
        </div>
        <Link href="/explore" className="link">
          View all reports →
        </Link>
      </div>

      <div className="overview-layout">
        <section className="card card-pad">
          <div className="filters">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                className={`chip ${filter === item ? 'selected' : ''}`}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="issue-list">
            {issues.slice(0, 4).map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
            {issues.length === 0 ? <div className="empty">No reports in this category.</div> : null}
          </div>
        </section>
        <section className="card card-pad">
          <div className="section-head">
            <h2>Explore the map</h2>
            <Link href="/explore" className="link">
              Open ↗
            </Link>
          </div>
          <LiveMap issues={issues} />
          <div className="map-caption">
            <div>
              <strong>Downtown Fredericton</strong>
              <p>See what neighbours have reported</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
