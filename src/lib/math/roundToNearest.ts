/**
 * Rounds a value to the nearest multiple of a given step.
 *
 * @param value - The value to round
 * @param step - The step to round to
 * @returns The rounded value
 *
 * @example
 * roundToNearest(47, 5) // returns 45
 * roundToNearest(48, 5) // returns 50
 * roundToNearest(47.8, 0.5) // returns 48
 */
export function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

