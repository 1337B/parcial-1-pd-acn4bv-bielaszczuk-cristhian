export enum Precipitation {
  none = 'none',
  rain = 'rain',
  snow = 'snow'
}

export enum DayPeriod {
  day = 'day',
  night = 'night'
}

export interface WeatherSnapshot {
  tempC: number;
  precipitationMm: number;
  precipitationType: Precipitation;
  windKph: number;
  timeISO: string;
}
