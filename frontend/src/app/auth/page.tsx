'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { authClient } from '@/lib/auth-client';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.6 7.1l6.3 5.3C37.4 38.4 44 33 44 24c0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function continueWithGoogle() {
    setError('');
    setPending(true);
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/',
    });
    if (result.error) {
      setError(result.error.message || 'Google sign-in failed');
      setPending(false);
    }
  }

  async function sendCode(event: FormEvent) {
    event.preventDefault();
    setError('');
    setPending(true);
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: 'sign-in',
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'Could not send the code');
      return;
    }
    setStep('code');
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setError('');
    setPending(true);
    const result = await authClient.signIn.emailOtp({
      email: email.trim(),
      otp: code.trim(),
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message || 'That code did not work');
      return;
    }
    router.push('/profile');
    router.refresh();
  }

  return (
    <div className="auth-screen">
      <section className="auth-hero">
        <Link href="/" className="brand auth-brand">
          <div className="brand-mark">✳</div>
          <div>
            <strong>
              Civic<span>.</span>
            </strong>
            <small>FREDERICTON</small>
          </div>
        </Link>
        <div className="auth-hero-copy">
          <div className="hero-kicker">
            <span className="hero-pulse" /> A CITY WE SHAPE TOGETHER
          </div>
          <h1>
            Make your
            <br />
            <em>voice count.</em>
          </h1>
          <p>Your reports and confirmations help turn everyday observations into visible action.</p>
          <div className="auth-sample">
            <span>↯</span>
            <div>
              <strong>Pothole on Queen Street</strong>
              <small>18 neighbours confirmed · City review</small>
              <i />
            </div>
          </div>
        </div>
        <div className="auth-steps">
          <b>01</b> Report <span>→</span> <b>02</b> Confirm <span>→</span> <b>03</b> Resolve
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-panel-top">
          <Link href="/">← Back to Civic</Link>
          <span>Account optional</span>
        </div>
        <div className="auth-card">
          <div className="eyebrow">YOUR CIVIC ACCOUNT</div>
          <h1>Welcome to Civic.</h1>
          <p>Sign in to track your reports, follow updates and see the impact you’re making.</p>
          {step === 'email' ? (
            <>
              <button type="button" className="auth-google" onClick={() => void continueWithGoogle()} disabled={pending}>
                <GoogleMark /> Continue with Google
              </button>
              <div className="auth-or">
                <span>or use your email</span>
              </div>
              <form onSubmit={(event) => void sendCode(event)}>
                <label htmlFor="civic-email">Email address</label>
                <input
                  id="civic-email"
                  className="auth-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <button type="submit" className="auth-submit" disabled={pending}>
                  <span>{pending ? 'Sending…' : 'Send a sign-in code'}</span>
                  <span aria-hidden="true">→</span>
                </button>
              </form>
              <p className="auth-note">No password needed. We’ll send a one-time code to your email.</p>
            </>
          ) : (
            <form onSubmit={(event) => void verifyCode(event)}>
              <label htmlFor="civic-code">Sign-in code</label>
              <p className="auth-note">Enter the 6-digit code for {email}. On this local setup it is printed in the Next.js terminal.</p>
              <input
                id="civic-code"
                className="auth-input"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                placeholder="123456"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
              <button type="submit" className="auth-submit" disabled={pending}>
                <span>{pending ? 'Checking…' : 'Sign in'}</span>
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" className="btn ghost" onClick={() => setStep('email')}>
                Use a different email
              </button>
            </form>
          )}
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="auth-guest">
            <div>
              <strong>Just want to report an issue?</strong>
              <p>You can still submit a report anonymously.</p>
            </div>
            <Link href="/report">Continue as guest →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
