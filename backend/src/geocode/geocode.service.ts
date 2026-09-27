import { Injectable, BadRequestException } from '@nestjs/common';

export interface ReverseGeocodeResult {
  display_name: string;
  latitude: number;
  longitude: number;
}

@Injectable()
export class GeocodeService {
  async reverseGeocode(
    latitude: number,
    longitude: number,
  ): Promise<ReverseGeocodeResult> {
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      throw new BadRequestException('Invalid coordinates');
    }

    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('format', 'json');
    url.searchParams.set('lat', String(latitude));
    url.searchParams.set('lon', String(longitude));
    url.searchParams.set('zoom', '18');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'FixMapFredericton/1.0 (civic reporting MVP)',
      },
    });

    if (!response.ok) {
      throw new BadRequestException('Reverse geocoding failed');
    }

    const data = (await response.json()) as { display_name?: string };
    return {
      display_name: data.display_name ?? `${latitude}, ${longitude}`,
      latitude,
      longitude,
    };
  }
}
