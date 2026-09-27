'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { setSessionToken } from '@/lib/session-token';

const NAV = [
  { href: '/', label: 'Overview', icon: '⌂', crumb: 'Overview' },
  { href: '/explore', label: 'Explore reports', icon: '▦', crumb: 'Explore reports' },
  { href: '/report', label: 'Report an issue', icon: '✚', crumb: 'Report an issue' },
  { href: '/profile', label: 'My impact', icon: '♙', crumb: 'My impact' },
] as const;

function crumbFor(pathname: string): string {
  if (pathname.startsWith('/issue/')) return 'Issue details';
  if (pathname.startsWith('/admin')) return 'Staff dashboard';
  return NAV.find((item) => item.href === pathname)?.crumb ?? 'Overview';
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [toast, setToast] = useState('');
  const { data: session } = authClient.useSession();
  const accountName = session?.user.name || session?.user.email || '';
  const initials = (accountName || 'CF').slice(0, 2).toUpperCase();

  useEffect(() => {
    setSessionToken(session?.session.token ?? null);
  }, [session]);

  useEffect(() => {
    const handler = (event: Event) => {
      const message = (event as CustomEvent<string>).detail;
      setToast(message);
      window.setTimeout(() => setToast(''), 2600);
    };
    window.addEventListener('civic-toast', handler);
    return () => window.removeEventListener('civic-toast', handler);
  }, []);

  const toastNode = (
    <div id="toast" className={toast ? 'show' : ''} role="status">
      {toast}
    </div>
  );

  if (pathname === '/auth') {
    return (
      <>
        {children}
        {toastNode}
      </>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <div className="brand-mark">✳</div>
          <div>
            <strong>
              Civic<span>.</span>
            </strong>
            <small>FREDERICTON</small>
          </div>
        </Link>
        <div className="side-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav ${pathname === item.href ? 'active' : ''}`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="side-label">FOR CITY STAFF</div>
          <Link href="/admin" className={`nav ${pathname.startsWith('/admin') ? 'active' : ''}`}>
            <span>▣</span> Staff dashboard
          </Link>
          <div className="community-note">
            <div className="note-icon">✳</div>
            <strong>A better city, together.</strong>
            <p>Small observations make a visible difference.</p>
          </div>
          <div className="side-footer">Fredericton, NB</div>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <div className="crumb">
            Fredericton <span>/</span> <b>{crumbFor(pathname)}</b>
          </div>
          <div className="top-actions">
            <span className="city-pill">
              <i /> Fredericton, NB
            </span>
            {session ? (
              <>
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Notifications"
                  onClick={() => {
                    setToast('No new notifications');
                    window.setTimeout(() => setToast(''), 2600);
                  }}
                >
                  ♧
                </button>
                <Link href="/profile" className="avatar" aria-label="Open profile">
                  {initials}
                </Link>
              </>
            ) : (
              <Link href="/auth" className="sign-in-pill">
                Sign in
                <ArrowUpRight size={15} strokeWidth={2.25} aria-hidden="true" />
              </Link>
            )}
          </div>
        </header>
        <main>{children}</main>
      </div>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        <Link href="/">
          ⌂<small>Home</small>
        </Link>
        <Link href="/explore">
          ▦<small>Explore</small>
        </Link>
        <Link href="/report" className="mobile-plus">
          ＋<small>Report</small>
        </Link>
        <Link href="/profile">
          ♙<small>Profile</small>
        </Link>
        <Link href="/admin">
          ▣<small>Staff</small>
        </Link>
      </nav>
      {toastNode}
    </div>
  );
}

export function civicToast(message: string) {
  window.dispatchEvent(new CustomEvent('civic-toast', { detail: message }));
}
