'use client';

import { Share2, ThumbsUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { IssueImage } from '@/components/ui/IssueImage';
import { StatusTimeline } from '@/components/issue/StatusTimeline';
import type { Issue } from '@/lib/types/issue';
import { ApiError, confirmIssue, reverseGeocode } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/format-relative-time';
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/issue-colors';

interface IssueDetailsModalProps {
  issue: Issue | null;
  onClose: () => void;
  onUpdated: (issue: Issue) => void;
}

export function IssueDetailsModal({
  issue,
  onClose,
  onUpdated,
}: IssueDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!issue) {
      setAddress(null);
      return;
    }

    void reverseGeocode(issue.latitude, issue.longitude)
      .then(setAddress)
      .catch(() =>
        setAddress(`${issue.latitude.toFixed(5)}, ${issue.longitude.toFixed(5)}`),
      );
  }, [issue]);

  if (!issue) return null;

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/issue/${issue.id}`
      : `/issue/${issue.id}`;

  async function handleConfirm() {
    setLoading(true);
    setConfirmError(null);

    const optimistic: Issue = {
      ...issue!,
      confirmations: issue!.confirmations + 1,
    };
    onUpdated(optimistic);

    try {
      const updated = await confirmIssue(issue!.id);
      onUpdated(updated);
    } catch (err) {
      onUpdated(issue!);
      if (err instanceof ApiError && err.status === 409) {
        setConfirmError('You already confirmed this issue');
      } else {
        setConfirmError(err instanceof Error ? err.message : 'Confirm failed');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleShare() {
    const payload = {
      title: issue!.title,
      text: 'Confirm this problem in FixMap!',
      url: shareUrl,
    };

    if (navigator.share) {
      await navigator.share(payload);
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    setShareMessage('Link copied to clipboard');
    setTimeout(() => setShareMessage(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-900">Issue details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <IssueImage src={issue.image_url} alt={issue.title} />

        <div className="space-y-3 p-4">
          <StatusTimeline status={issue.status} />

          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: STATUS_COLORS[issue.status] }}
            >
              {STATUS_LABELS[issue.status]}
            </span>
            <span className="text-sm text-slate-500">
              {formatRelativeTime(issue.created_at)}
            </span>
          </div>

          <h3 className="text-xl font-semibold text-slate-900">{issue.title}</h3>
          {issue.description ? (
            <p className="text-sm text-slate-600">{issue.description}</p>
          ) : null}
          <p className="text-xs text-slate-500">{address ?? 'Loading address…'}</p>
          <p className="text-sm font-medium text-slate-700">
            {issue.confirmations} people confirmed
          </p>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={handleConfirm}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
            >
              <ThumbsUp className="h-4 w-4" />
              Confirm
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
          {confirmError ? (
            <p className="text-center text-xs text-red-600">{confirmError}</p>
          ) : null}
          {shareMessage ? (
            <p className="text-center text-xs text-emerald-600">{shareMessage}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
