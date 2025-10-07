import { Precipitation } from '@/domain';

/**
 * Returns a human-readable label for a Precipitation enum value.
 *
 * @param precipitation - The Precipitation enum value
 * @returns A formatted label string
 *
 * @example
 * precipitationLabel(Precipitation.none) // returns 'None'
 * precipitationLabel(Precipitation.rain) // returns 'Rain'
 * precipitationLabel(Precipitation.snow) // returns 'Snow'
 */
export function precipitationLabel(precipitation: Precipitation | string): string {
  switch (precipitation) {
    case Precipitation.none:
    case 'none':
      return 'None';
    case Precipitation.rain:
    case 'rain':
      return 'Rain';
    case Precipitation.snow:
    case 'snow':
      return 'Snow';
    default:
      return String(precipitation);
  }
}

/**
 * Returns the speed factor for a given precipitation type.
 *
 * @param precipitation - The Precipitation enum value or string
 * @returns The multiplication factor for speed calculation
 */
export function precipitationFactor(precipitation: Precipitation | string): number {
  switch (precipitation) {
    case Precipitation.none:
    case 'none':
      return 1.0;
    case Precipitation.rain:
    case 'rain':
      return 0.85;
    case Precipitation.snow:
    case 'snow':
      return 0.7;
    default:
      return 1.0;
  }
}

