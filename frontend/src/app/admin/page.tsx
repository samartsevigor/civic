'use client';

import { useCallback, useEffect, useState } from 'react';
import { civicToast } from '@/components/civic/AppShell';
import { getIssueStats, getIssues, updateIssueStatus } from '@/lib/api-client';
import { issuePlace, publicStatusLabel, statusBadgeClass } from '@/lib/civic';
import type { Issue, IssueStats, IssueStatus } from '@/lib/types/issue';

const STAFF_STATUSES: IssueStatus[] = [
  'reported',
  'verified',
  'sent_to_org',
  'in_progress',
  'resolved',
  'rejected',
  'blocked',
];

export default function StaffPage() {
  const [adminKey, setAdminKey] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState<IssueStats | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async (key: string) => {
    const [rows, summary] = await Promise.all([
      getIssues({ includeRejected: true, adminKey: key }),
      getIssueStats(key),
    ]);
    setIssues(rows);
    setStats(summary);
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem('fixmap_admin_key');
    if (!stored) return;
    setAdminKey(stored);
    setUnlocked(true);
    void load(stored).catch(() => civicToast('Staff key was rejected'));
  }, [load]);

  async function changeStatus(issue: Issue, status: IssueStatus) {
    const updated = await updateIssueStatus(issue.id, status, adminKey, note || undefined);
    setIssues((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
    civicToast('Status updated');
    if (adminKey) void getIssueStats(adminKey).then(setStats);
  }

  if (!unlocked) {
    return (
      <div className="content">
        <div className="page-intro">
          <div>
            <div className="eyebrow">CITY STAFF</div>
            <h1>Staff access</h1>
            <p>Enter the staff key from the backend environment.</p>
          </div>
        </div>
        <form
          className="card form-card"
          onSubmit={(event) => {
            event.preventDefault();
            sessionStorage.setItem('fixmap_admin_key', adminKey);
            setUnlocked(true);
            void load(adminKey).catch(() => civicToast('Could not open staff dashboard'));
          }}
        >
          <div className="field">
            <label htmlFor="key">Staff key</label>
            <input
              id="key"
              type="password"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              required
            />
          </div>
          <button className="btn" type="submit">
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">CITY STAFF</div>
          <h1>Report management</h1>
          <p>Review community reports, verify details and keep residents informed.</p>
        </div>
      </div>
      <div className="admin-metrics">
        <div className="card stat">
          <div className="symbol">▤</div>
          <div className="number">{stats?.byStatus.reported ?? 0}</div>
          <div className="desc">New to review</div>
        </div>
        <div className="card stat">
          <div className="symbol">✓</div>
          <div className="number">{stats?.byStatus.verified ?? 0}</div>
          <div className="desc">Verified</div>
        </div>
        <div className="card stat">
          <div className="symbol">◈</div>
          <div className="number">{stats?.byStatus.in_progress ?? 0}</div>
          <div className="desc">In progress</div>
        </div>
        <div className="card stat">
          <div className="symbol">◎</div>
          <div className="number">{stats?.byStatus.resolved ?? 0}</div>
          <div className="desc">Resolved</div>
        </div>
      </div>
      <div className="admin-grid">
        <section className="card card-pad">
          <div className="section-head">
            <h2>Incoming reports</h2>
            <span className="muted" style={{ fontSize: 12 }}>
              Sorted by recent activity
            </span>
          </div>
          <div className="field">
            <label htmlFor="note">Public update note (optional, used on next status change)</label>
            <input id="note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ISSUE</th>
                  <th>STATUS</th>
                  <th>CONFIRMATIONS</th>
                  <th>UPDATE STATUS</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id}>
                    <td>
                      <a href={`/issue/${issue.id}`} className="link" style={{ color: 'var(--ink)' }}>
                        {issue.title}
                      </a>
                      <div className="muted" style={{ fontWeight: 400, fontSize: 11, marginTop: 4 }}>
                        {issuePlace(issue)}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${statusBadgeClass(issue.status)}`}>
                        {publicStatusLabel(issue.status)}
                      </span>
                    </td>
                    <td>{issue.confirmations}</td>
                    <td>
                      <select
                        aria-label={`Update ${issue.title}`}
                        value={issue.status}
                        onChange={(event) =>
                          void changeStatus(issue, event.target.value as IssueStatus)
                        }
                      >
                        {STAFF_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {publicStatusLabel(status)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="card card-pad">
          <h3>Review checklist</h3>
          <div className="tip">
            <b>1</b>
            <span>Check the location and look for duplicates.</span>
          </div>
          <div className="tip">
            <b>2</b>
            <span>Verify the report before changing priority.</span>
          </div>
          <div className="tip">
            <b>3</b>
            <span>Keep the public status current as work proceeds.</span>
          </div>
          <div className="staff-note">
            <strong style={{ color: 'var(--ink)' }}>Trust signal</strong>
            <br />
            Confirmations help prioritize reliable reports, but staff still review evidence and location before action.
          </div>
        </aside>
      </div>
    </div>
  );
}
