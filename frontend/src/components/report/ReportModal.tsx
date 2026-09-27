'use client';

import {
  AlertTriangle,
  Camera,
  Construction,
  Lightbulb,
  Trash2,
  TrafficCone,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type ComponentType } from 'react';
import type { Issue, IssueCategory } from '@/lib/types/issue';
import { createIssue, getNearbyIssues, reverseGeocode } from '@/lib/api-client';
import { FREDERICTON_CENTER } from '@/lib/constants';

const LocationPickerMap = dynamic(
  () =>
    import('./LocationPickerMap').then((mod) => mod.LocationPickerMap),
  { ssr: false, loading: () => <div className="h-40 animate-pulse rounded-xl bg-slate-100" /> },
);

const CATEGORIES: {
  value: IssueCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { value: 'pothole', label: 'Roads', icon: Construction },
  { value: 'lighting', label: 'Lighting', icon: Lightbulb },
  { value: 'garbage', label: 'Garbage', icon: Trash2 },
  { value: 'sidewalk', label: 'Sidewalk', icon: AlertTriangle },
  { value: 'traffic_light', label: 'Traffic', icon: TrafficCone },
  { value: 'other', label: 'Other', icon: AlertTriangle },
];

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (issue: Issue) => void;
}

export function ReportModal({ open, onClose, onCreated }: ReportModalProps) {
  const [category, setCategory] = useState<IssueCategory>('pothole');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState(FREDERICTON_CENTER[0]);
  const [longitude, setLongitude] = useState(FREDERICTON_CENTER[1]);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState<string | null>(null);
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!open) return;

    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation unavailable. Adjust pin on the map.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      },
      () => {
        setGeoError('Could not detect GPS. Adjust pin on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [open]);

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
    if (!open) return;

    const timer = window.setTimeout(() => {
      void reverseGeocode(latitude, longitude)
        .then((value) => setAddressLabel(value.split(',').slice(0, 2).join(',').trim()))
        .catch(() => setAddressLabel(null));

      void getNearbyIssues(latitude, longitude, category)
        .then(setNearbyIssues)
        .catch(() => setNearbyIssues([]));
    }, 400);

    return () => window.clearTimeout(timer);
  }, [open, latitude, longitude, category]);

  const shareUrl = useMemo(() => {
    if (!successId || typeof window === 'undefined') return '';
    return `${window.location.origin}/issue/${successId}`;
  }, [successId]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const result = await createIssue({
        category,
        latitude,
        longitude,
        description: description.trim() || undefined,
        file,
      });
      setSuccessId(result.issue.id);
      onCreated(result.issue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleShareSuccess() {
    if (!shareUrl) return;
    if (navigator.share) {
      await navigator.share({
        title: 'FixMap report',
        text: 'New civic issue reported in FixMap',
        url: shareUrl,
      });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
  }

  function handleClose() {
    setSuccessId(null);
    setDescription('');
    setFile(null);
    setError(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Report a problem</h2>
          <button type="button" onClick={handleClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {successId ? (
          <div className="space-y-4 p-6 text-center">
            <p className="text-lg font-semibold text-emerald-700">Report submitted</p>
            <p className="text-sm text-slate-600 break-all">{shareUrl}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShareSuccess}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Share link
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Preview" className="h-full w-full rounded-xl object-cover" />
              ) : (
                <>
                  <Camera className="mb-2 h-8 w-8 text-slate-500" />
                  <span className="text-sm text-slate-600">Take or upload photo</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <p>{addressLabel ?? `Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}</p>
              {geoError ? <p className="mt-1 text-amber-700">{geoError}</p> : null}
            </div>

            {nearbyIssues.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-semibold">Similar reports nearby</p>
                <ul className="mt-2 space-y-1 text-xs">
                  {nearbyIssues.slice(0, 3).map((item) => (
                    <li key={item.id}>• {item.title}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">Consider confirming an existing report instead.</p>
              </div>
            ) : null}

            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
            />

            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon }) => {
                const active = category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-xs font-medium ${
                      active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none ring-emerald-500 focus:ring-2"
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
