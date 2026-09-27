'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { civicToast } from '@/components/civic/AppShell';
import { createIssue, getNearbyIssues, reverseGeocode } from '@/lib/api-client';
import { CATEGORY_META } from '@/lib/civic';
import { FREDERICTON_CENTER } from '@/lib/constants';
import type { Issue, IssueCategory } from '@/lib/types/issue';

const LocationPickerMap = dynamic(
  () => import('@/components/report/LocationPickerMap').then((mod) => mod.LocationPickerMap),
  { ssr: false },
);

const CATEGORIES = Object.entries(CATEGORY_META) as [
  IssueCategory,
  (typeof CATEGORY_META)[IssueCategory],
][];

export default function ReportPage() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(FREDERICTON_CENTER[0]);
  const [longitude, setLongitude] = useState(FREDERICTON_CENTER[1]);
  const [nearby, setNearby] = useState<Issue[]>([]);
  const [doneId, setDoneId] = useState<string | null>(null);
  const [doneBlocked, setDoneBlocked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => undefined,
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    if (step !== 3) return;
    void reverseGeocode(latitude, longitude)
      .then((value) => {
        if (!address) setAddress(value.split(',').slice(0, 2).join(',').trim());
      })
      .catch(() => undefined);
    void getNearbyIssues(latitude, longitude, category)
      .then(setNearby)
      .catch(() => setNearby([]));
  }, [step, latitude, longitude, category, address]);

  async function submit() {
    if (!address.trim()) {
      civicToast('Add a location');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createIssue({
        category,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        latitude,
        longitude,
        file,
      });
      setDoneBlocked(result.issue.status === 'blocked');
      setDoneId(result.issue.id);
    } catch (error) {
      civicToast(error instanceof Error ? error.message : 'Could not submit report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="content">
      <div className="page-intro">
        <div>
          <div className="eyebrow">REPORT AN ISSUE</div>
          <h1>Help improve your city</h1>
          <p>A report takes about two minutes. An account is optional.</p>
        </div>
      </div>
      <div className="form-layout">
        <section className="card form-card">
          {!doneId ? (
            <div className="steps">
              <span className={`step ${step >= 1 ? 'on' : ''}`} />
              <span className={`step ${step >= 2 ? 'on' : ''}`} />
              <span className={`step ${step >= 3 ? 'on' : ''}`} />
            </div>
          ) : null}

          {doneId ? (
            <div style={{ textAlign: 'center', padding: '34px 12px' }}>
              <div style={{ fontSize: 50, color: 'var(--green)' }}>{doneBlocked ? '!' : '✓'}</div>
              <h2>{doneBlocked ? 'This photo can’t be published.' : 'Thanks for looking out for Fredericton.'}</h2>
              <p className="muted" style={{ lineHeight: 1.6, margin: '12px auto 24px', maxWidth: 390 }}>
                {doneBlocked
                  ? 'The picture looks explicit, so the report stays hidden. Other people won’t see it.'
                  : 'Your report has been submitted. Others can confirm it, and you can follow its progress.'}
              </p>
              {doneBlocked ? (
                <Link href="/" className="btn">
                  Back to overview
                </Link>
              ) : (
                <Link href={`/issue/${doneId}`} className="btn">
                  View your report
                </Link>
              )}
            </div>
          ) : null}

          {!doneId && step === 1 ? (
            <>
              <h2>What needs attention?</h2>
              <p className="muted" style={{ fontSize: 13, margin: '8px 0 25px' }}>
                Choose the category that best describes the issue.
              </p>
              <div className="category-grid">
                {CATEGORIES.map(([id, meta]) => (
                  <button
                    key={id}
                    type="button"
                    className={`category ${category === id ? 'active' : ''}`}
                    onClick={() => setCategory(id)}
                  >
                    <span>{meta.icon}</span>
                    {meta.label}
                  </button>
                ))}
              </div>
              <div className="form-actions">
                <span />
                <button type="button" className="btn" onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            </>
          ) : null}

          {!doneId && step === 2 ? (
            <>
              <h2>Tell us a little more</h2>
              <p className="muted" style={{ fontSize: 13, margin: '8px 0 25px' }}>
                A clear description helps neighbours confirm the issue.
              </p>
              <div className="field">
                <label htmlFor="title">Short title</label>
                <input
                  id="title"
                  value={title}
                  maxLength={80}
                  placeholder="e.g. Pothole on Queen Street"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="desc">Description</label>
                <textarea
                  id="desc"
                  value={description}
                  placeholder="What happened? Is there a safety concern?"
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="photo">Photo</label>
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="upload-preview" src={previewUrl} alt="Selected report photo" />
                ) : null}
                <label className="upload" htmlFor="photo">
                  ↥ &nbsp;{file ? file.name : 'Add a photo'}
                  <small>A photo is required so neighbours can recognize the issue</small>
                </label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  style={{ display: 'none' }}
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (!title.trim() || !description.trim()) {
                      civicToast('Add a title and description');
                      return;
                    }
                    if (!file) {
                      civicToast('Add a photo');
                      return;
                    }
                    setStep(3);
                  }}
                >
                  Continue →
                </button>
              </div>
            </>
          ) : null}

          {!doneId && step === 3 ? (
            <>
              <h2>Where is the issue?</h2>
              <p className="muted" style={{ fontSize: 13, margin: '8px 0 20px' }}>
                Enter a nearby address or drag the pin. A precise location helps city staff find it.
              </p>
              <div className="field">
                <label htmlFor="address">Street or landmark</label>
                <input
                  id="address"
                  value={address}
                  placeholder="e.g. Queen St near Regent St"
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
              <div className="mini-map" style={{ height: 210 }}>
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>
              {nearby.length > 0 ? (
                <div className="privacy-box" style={{ marginTop: 16 }}>
                  <span>!</span>
                  <span>
                    <strong>Similar reports nearby</strong>
                    <br />
                    {nearby.slice(0, 3).map((item) => item.title).join(' · ')}
                  </span>
                </div>
              ) : null}
              <div className="privacy-box" style={{ marginTop: 16 }}>
                <span>◈</span>
                <span>
                  <strong>Post without an account</strong>
                  <br />
                  You can submit anonymously. Add a display name later to track your reports.
                </span>
              </div>
              <div className="form-actions">
                <button type="button" className="btn secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button type="button" className="btn" disabled={submitting} onClick={() => void submit()}>
                  {submitting ? 'Submitting…' : 'Submit report →'}
                </button>
              </div>
            </>
          ) : null}
        </section>
        <aside className="card form-side">
          <div className="eyebrow">A GOOD REPORT</div>
          <h3>Help people understand what you see</h3>
          <p>You don’t need to know which department handles it. Just describe the problem and where to find it.</p>
          <div className="tip">
            <b>1</b>
            <span>Check if someone has already reported the same issue nearby.</span>
          </div>
          <div className="tip">
            <b>2</b>
            <span>Add a clear description and a photo of the issue.</span>
          </div>
          <div className="tip">
            <b>3</b>
            <span>Follow progress after city staff review the report.</span>
          </div>
          <Link href="/explore" className="btn secondary wide">
            Check existing reports
          </Link>
        </aside>
      </div>
    </div>
  );
}
