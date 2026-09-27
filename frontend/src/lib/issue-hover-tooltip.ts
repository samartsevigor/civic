import type { TooltipOptions } from 'leaflet';
import { resolveMediaUrl } from '@/lib/api-client';
import { STATUS_LABELS } from '@/lib/issue-colors';
import type { Issue } from '@/lib/types/issue';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function buildIssueHoverTooltipHtml(issue: Issue): string {
  const title = escapeHtml(issue.title);
  const status = escapeHtml(STATUS_LABELS[issue.status]);
  const imageUrl = resolveMediaUrl(issue.image_url);

  if (!imageUrl) {
    return `<div class="issue-hover-tooltip__text-only"><strong>${title}</strong><span>${status}</span></div>`;
  }

  return `
    <div class="issue-hover-tooltip__card">
      <img class="issue-hover-tooltip__image" src="${escapeHtml(imageUrl)}" alt="${title}" loading="lazy" />
      <div class="issue-hover-tooltip__body">
        <strong>${title}</strong>
        <span>${status}</span>
      </div>
    </div>
  `.trim();
}

export const ISSUE_HOVER_TOOLTIP_OPTIONS: TooltipOptions = {
  direction: 'top',
  sticky: true,
  opacity: 1,
  className: 'issue-hover-tooltip',
};
