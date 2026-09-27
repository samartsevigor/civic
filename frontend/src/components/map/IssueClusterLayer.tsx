'use client';

import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { Issue } from '@/lib/types/issue';
import { STATUS_COLORS } from '@/lib/issue-colors';
import {
  buildIssueHoverTooltipHtml,
  ISSUE_HOVER_TOOLTIP_OPTIONS,
} from '@/lib/issue-hover-tooltip';

import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface IssueClusterLayerProps {
  issues: Issue[];
  onSelect: (issue: Issue) => void;
  dimRejected?: boolean;
}

function createClusterGroup(): L.LayerGroup {
  // leaflet.markercluster attaches itself to the Leaflet namespace
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('leaflet.markercluster');

  const clusterFactory = (
    L as typeof L & {
      markerClusterGroup?: (options?: Record<string, unknown>) => L.LayerGroup;
    }
  ).markerClusterGroup;

  if (typeof clusterFactory === 'function') {
    return clusterFactory({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    });
  }

  return L.layerGroup();
}

export function IssueClusterLayer({
  issues,
  onSelect,
  dimRejected = false,
}: IssueClusterLayerProps) {
  const map = useMap();

  useEffect(() => {
    const group = createClusterGroup();

    for (const issue of issues) {
      const color = STATUS_COLORS[issue.status];
      const faded = dimRejected && issue.status === 'rejected';
      const marker = L.circleMarker([issue.latitude, issue.longitude], {
        radius: 10,
        color,
        fillColor: color,
        fillOpacity: faded ? 0.35 : 0.85,
        weight: 2,
      });

      marker.on('click', () => onSelect(issue));
      marker.bindTooltip(
        buildIssueHoverTooltipHtml(issue),
        ISSUE_HOVER_TOOLTIP_OPTIONS,
      );
      group.addLayer(marker);
    }

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [issues, map, onSelect, dimRejected]);

  return null;
}
