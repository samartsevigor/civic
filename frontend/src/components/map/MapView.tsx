'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { Issue } from '@/lib/types/issue';
import { FREDERICTON_CENTER } from '@/lib/constants';
import { configureLeafletDefaults } from '@/lib/leaflet-setup';
import { OSM_TILE_ATTRIBUTION, OSM_TILE_URL } from '@/lib/map-tiles';
import { IssueClusterLayer } from './IssueClusterLayer';

function MapReady() {
  const map = useMap();

  useEffect(() => {
    const refresh = () => map.invalidateSize();
    refresh();
    const timer = window.setTimeout(refresh, 200);
    window.addEventListener('resize', refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', refresh);
    };
  }, [map]);

  return null;
}

interface MapViewProps {
  issues: Issue[];
  onIssueSelect: (issue: Issue) => void;
  dimRejected?: boolean;
  className?: string;
}

export function MapView({
  issues,
  onIssueSelect,
  dimRejected,
  className = 'h-full w-full',
}: MapViewProps) {
  useEffect(() => {
    configureLeafletDefaults();
  }, []);

  return (
    <MapContainer
      center={FREDERICTON_CENTER}
      zoom={14}
      scrollWheelZoom
      dragging
      zoomControl
      className={className}
    >
      <MapReady />
      <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
      <IssueClusterLayer
        issues={issues}
        onSelect={onIssueSelect}
        dimRejected={dimRejected}
      />
    </MapContainer>
  );
}
