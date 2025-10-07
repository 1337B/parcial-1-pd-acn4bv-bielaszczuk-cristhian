import { Surface } from '@/domain';

/**
 * Returns a human-readable label for a Surface enum value.
 *
 * @param surface - The Surface enum value
 * @returns A formatted label string
 *
 * @example
 * surfaceLabel(Surface.asphalt) // returns 'Asphalt'
 * surfaceLabel(Surface.gravel) // returns 'Gravel'
 */
export function surfaceLabel(surface: Surface): string {
  switch (surface) {
    case Surface.asphalt:
      return 'Asphalt';
    case Surface.gravel:
      return 'Gravel';
    case Surface.dirt:
      return 'Dirt';
    default:
      return surface;
  }
}

/**
 * Returns the speed factor for a given surface type.
 *
 * @param surface - The Surface enum value
 * @returns The multiplication factor for speed calculation
 */
export function surfaceFactor(surface: Surface): number {
  switch (surface) {
    case Surface.asphalt:
      return 1.0;
    case Surface.gravel:
      return 0.8;
    case Surface.dirt:
      return 0.7;
    default:
      return 1.0;
  }
}

