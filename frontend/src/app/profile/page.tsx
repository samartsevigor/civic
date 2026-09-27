'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { IssueRow } from '@/components/civic/IssueRow';
import { civicToast } from '@/components/civic/AppShell';
import { authClient } from '@/lib/auth-client';
import {
  getLeaderboard,
  getMyActivity,
  getProfile,
  saveProfile,
  type ProfileStats,
} from '@/lib/api-client';
import { setSessionToken } from '@/lib/session-token';
import type { Issue } from '@/lib/types/issue';

export default function ProfilePage() {
  const [name, setName] = useState('');
  const [signedIn, setSignedIn] = useState(false);
  const [showPublic, setShowPublic] = useState(true);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [activity, setActivity] = useState<Issue[]>([]);
  const [board, setBoard] = useState<{ displayName: string; points: number }[]>([]);
  const { data: session, isPending } = authClient.useSession();

  async function refresh() {
    const me = await getProfile();
    setSignedIn(Boolean(session?.user));
    setName(me.profile?.display_name || session?.user.name || '');
    setShowPublic(me.profile?.show_on_leaderboard ?? false);
    setStats(me.stats);
    setActivity(await getMyActivity());
    setBoard(await getLeaderboard());
  }

  useEffect(() => {
    setSessionToken(session?.session.token ?? null);
    if (isPending) return;
    void refresh().catch(() => civicToast('Could not load profile'));
    // Session identity is the only input; refresh reads the latest token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.session.token, session?.user?.id, isPending]);

  async function save() {
    if (!session) return;
    if (!name.trim()) {
      civicToast('Add a display name');
      return;
    }
    await authClient.updateUser({ name: name.trim() });
    await saveProfile(name.trim(), showPublic);
    civicToast('Profile updated');
    await refresh();
  }

  async function signOut() {
    await authClient.signOut();
    setSessionToken(null);
    civicToast('Signed out');
  }

  const initials = (name || 'CF').slice(0, 2).toUpperCase();

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">YOUR CONTRIBUTIONS</div>
          <h1>My impact</h1>
          <p>See how your reports and confirmations help your community.</p>
        </div>
      </div>
      <section className="card" style={{ marginBottom: 21 }}>
        <div className="profile-cover" />
        <div className="profile-info">
          <div>
            <div className="profile-photo">{initials}</div>
            <h2>{signedIn ? name || 'Your civic profile' : 'Your civic profile'}</h2>
            <p>
              {signedIn
                ? `${session?.user.email ?? 'Signed in'} · contributions follow this account`
                : 'Sign in to save your contributions across devices'}
            </p>
          </div>
          <div style={{ display: 'grid', gap: 8, minWidth: 220 }}>
            {signedIn ? (
              <>
                <input
                  className="search"
                  value={name}
                  placeholder="Display name"
                  onChange={(event) => setName(event.target.value)}
                />
                <label className="muted" style={{ fontSize: 12 }}>
                  <input
                    type="checkbox"
                    checked={showPublic}
                    onChange={(event) => setShowPublic(event.target.checked)}
                  />{' '}
                  Show me on the public leaderboard
                </label>
                <button type="button" className="btn" onClick={() => void save()}>
                  Update profile
                </button>
                <button type="button" className="btn secondary" onClick={() => void signOut()}>
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/auth" className="btn">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </section>
      <div className="profile-grid">
        <div>
          <div className="impact-row">
            <div className="card impact-stat">
              <strong>{signedIn ? stats?.reports ?? 0 : '—'}</strong>
              <span>Reports submitted</span>
            </div>
            <div className="card impact-stat">
              <strong>{signedIn ? stats?.confirmations ?? 0 : '—'}</strong>
              <span>Issues confirmed</span>
            </div>
            <div className="card impact-stat">
              <strong>{signedIn ? stats?.resolved ?? 0 : '—'}</strong>
              <span>Reports resolved</span>
            </div>
          </div>
          <section className="card card-pad">
            <div className="section-head">
              <h2>My activity</h2>
              <span className="muted" style={{ fontSize: 12 }}>
                Recent
              </span>
            </div>
            {activity.length > 0 ? (
              activity.map((issue) => <IssueRow key={issue.id} issue={issue} />)
            ) : (
              <div className="empty">
                {signedIn ? 'Reports from this account will show up here.' : 'Sign in to see reports tied to your account.'}
              </div>
            )}
          </section>
        </div>
        <section className="card card-pad">
          <div className="section-head">
            <h2>Community contributors</h2>
            <span className="muted" style={{ fontSize: 11 }}>
              USEFUL WORK
            </span>
          </div>
          <p className="muted" style={{ fontSize: 12, lineHeight: 1.5 }}>
            Points come from submitted reports, confirmations and resolved issues. Exact locations are never shown.
          </p>
          <ol className="rank-list">
            {board.map((row, index) => (
              <li key={row.displayName} className={row.displayName === name ? 'me' : ''}>
                <span className="place">{String(index + 1).padStart(2, '0')}</span>
                <span className="name">{row.displayName}</span>
                <span className="points">{row.points} pts</span>
              </li>
            ))}
            {board.length === 0 ? <li>No public contributors yet.</li> : null}
          </ol>
        </section>
      </div>
    </div>
  );
}
