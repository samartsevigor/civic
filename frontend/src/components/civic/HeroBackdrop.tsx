'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { FREDERICTON_CENTER } from '@/lib/constants';
import { configureLeafletDefaults } from '@/lib/leaflet-setup';
import { OSM_TILE_ATTRIBUTION, OSM_TILE_URL } from '@/lib/map-tiles';

export function HeroBackdrop() {
  useEffect(() => {
    configureLeafletDefaults();
  }, []);

  return (
    <MapContainer
      center={FREDERICTON_CENTER}
      zoom={14}
      zoomControl={false}
      attributionControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      className="hero-leaflet"
    >
      <TileLayer attribution={OSM_TILE_ATTRIBUTION} url={OSM_TILE_URL} />
    </MapContainer>
  );
}
