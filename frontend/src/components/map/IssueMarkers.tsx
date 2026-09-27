'use client';

import { CircleMarker, Popup } from 'react-leaflet';
import type { Issue } from '@/lib/types/issue';
import { STATUS_COLORS } from '@/lib/issue-colors';

interface IssueMarkersProps {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
  dimRejected?: boolean;
}

export function IssueMarkers({
  issues,
  onSelect,
  dimRejected = false,
}: IssueMarkersProps) {
  return (
    <>
      {issues.map((issue) => {
        const color = STATUS_COLORS[issue.status];
        const faded = dimRejected && issue.status === 'rejected';

        return (
          <CircleMarker
            key={issue.id}
            center={[issue.latitude, issue.longitude]}
            radius={10}
            pathOptions={{
              color,
              fillColor: color,
              fillOpacity: faded ? 0.35 : 0.85,
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelect(issue),
            }}
          >
            <Popup>{issue.title}</Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
