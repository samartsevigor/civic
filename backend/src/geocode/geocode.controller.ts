import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GeocodeService } from './geocode.service';

@ApiTags('geocode')
@Controller('geocode')
export class GeocodeController {
  constructor(private readonly geocodeService: GeocodeService) {}

  @Get('reverse')
  reverse(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
  ) {
    return this.geocodeService.reverseGeocode(
      Number(latitude),
      Number(longitude),
    );
  }
}
