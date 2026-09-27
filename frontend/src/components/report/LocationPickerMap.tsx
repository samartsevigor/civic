'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { configureLeafletDefaults } from '@/lib/leaflet-setup';
import { OSM_TILE_URL } from '@/lib/map-tiles';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

function DraggablePin({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  useMapEvents({
    click(event) {
      onChange(event.latlng.lat, event.latlng.lng);
    },
  });

  return (
    <CircleMarker
      center={[latitude, longitude]}
      radius={10}
      pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.9 }}
    />
  );
}

export function LocationPickerMap(props: LocationPickerMapProps) {
  useEffect(() => {
    configureLeafletDefaults();
  }, []);

  return (
    <MapContainer
      center={[props.latitude, props.longitude]}
      zoom={15}
      scrollWheelZoom
      className="h-40 w-full rounded-xl"
    >
      <TileLayer url={OSM_TILE_URL} />
      <DraggablePin {...props} />
    </MapContainer>
  );
}
