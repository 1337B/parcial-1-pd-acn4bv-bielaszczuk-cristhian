import { DayPeriod } from '@/domain';

/**
 * Returns a human-readable label for a DayPeriod enum value.
 *
 * @param dayPeriod - The DayPeriod enum value
 * @returns A formatted label string
 *
 * @example
 * dayPeriodLabel(DayPeriod.day) // returns 'Day'
 * dayPeriodLabel(DayPeriod.night) // returns 'Night'
 */
export function dayPeriodLabel(dayPeriod: DayPeriod): string {
  switch (dayPeriod) {
    case DayPeriod.day:
      return 'Day';
    case DayPeriod.night:
      return 'Night';
    default:
      return dayPeriod;
  }
}

/**
 * Returns the speed factor for a given day period.
 *
 * @param dayPeriod - The DayPeriod enum value
 * @returns The multiplication factor for speed calculation
 */
export function dayPeriodFactor(dayPeriod: DayPeriod): number {
  return dayPeriod === DayPeriod.day ? 1.0 : 0.9;
}

