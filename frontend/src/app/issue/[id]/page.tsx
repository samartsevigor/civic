'use client';

import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import { LiveMap } from '@/components/civic/LiveMap';
import { IssueImage } from '@/components/ui/IssueImage';
import {
  ApiError,
  confirmIssue,
  getIssue,
  getIssueUpdates,
  type IssueUpdate,
} from '@/lib/api-client';
import { civicToast } from '@/components/civic/AppShell';
import { issuePlace, publicStatusLabel, statusBadgeClass } from '@/lib/civic';
import { formatRelativeTime } from '@/lib/format-relative-time';
import type { Issue } from '@/lib/types/issue';

export default function IssuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [updates, setUpdates] = useState<IssueUpdate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getIssue(id)
      .then(setIssue)
      .catch(() => setError('This report could not be loaded.'));
    void getIssueUpdates(id)
      .then(setUpdates)
      .catch(() => setUpdates([]));
  }, [id]);

  async function confirm() {
    if (!issue) return;
    try {
      const updated = await confirmIssue(issue.id);
      setIssue(updated);
      civicToast('Thanks for confirming');
    } catch (err) {
      civicToast(
        err instanceof ApiError && err.status === 409
          ? 'You already confirmed this, or it is your own report'
          : 'Could not confirm',
      );
    }
  }

  if (error) {
    return (
      <div className="content">
        <div className="empty">{error}</div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="content">
        <div className="empty">Loading report…</div>
      </div>
    );
  }

  return (
    <div className="content">
      <Link href="/explore" className="link" style={{ marginBottom: 20, display: 'inline-block' }}>
        ← Back to reports
      </Link>
      <div className="detail-layout">
        <section className="card card-pad">
          <div className="detail-title">
            <div>
              <div className="eyebrow">REPORT</div>
              <h1>{issue.title}</h1>
              <p className="muted">
                ⌖ {issuePlace(issue)} &nbsp; · &nbsp; Reported {formatRelativeTime(issue.created_at)}
              </p>
            </div>
            <span className={`badge ${statusBadgeClass(issue.status)}`}>
              {publicStatusLabel(issue.status)}
            </span>
          </div>
          <div style={{ marginTop: 18 }}>
            <IssueImage src={issue.image_url} alt={issue.title} className="h-60 w-full rounded-xl object-cover" />
          </div>
          <h3 style={{ marginTop: 23 }}>What was reported</h3>
          <p className="detail-copy">{issue.description || 'No extra description was provided.'}</p>
          <div className="privacy-box">
            <span style={{ fontSize: 17, color: 'var(--green)' }}>✓</span>
            <span>
              <strong>Can you confirm this issue?</strong>
              <br />
              Confirm only if you’ve seen it yourself. Community confirmation is separate from city verification.
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 15 }}>
            <button type="button" className="btn" onClick={() => void confirm()}>
              ✓ I can confirm this
            </button>
            <span className="muted" style={{ fontSize: 12 }}>
              {issue.confirmations} confirmations
            </span>
          </div>
        </section>
        <div>
          <section className="card card-pad">
            <h3>Location</h3>
            <div style={{ marginTop: 15 }}>
              <LiveMap issues={[issue]} />
            </div>
            <p className="muted" style={{ fontSize: 12, margin: '12px 0 0' }}>
              {issuePlace(issue)}, Fredericton, NB
            </p>
          </section>
          <section className="card card-pad" style={{ marginTop: 20 }}>
            <h3>Progress</h3>
            <ol className="timeline" style={{ marginTop: 22 }}>
              <li>
                <strong>Report submitted</strong>
                Community report received
              </li>
              <li>
                <strong>Confirmed by neighbours</strong>
                {issue.confirmations} people have confirmed this issue
              </li>
              {updates.map((update) => (
                <li key={update.id}>
                  <strong>{publicStatusLabel(update.status)}</strong>
                  {update.public_note || `Updated ${formatRelativeTime(update.created_at)}`}
                </li>
              ))}
              {updates.length === 0 ? (
                <li>
                  <strong>City review</strong>
                  {issue.status === 'reported'
                    ? 'Waiting for staff review'
                    : 'Staff are aware of this report'}
                </li>
              ) : null}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
