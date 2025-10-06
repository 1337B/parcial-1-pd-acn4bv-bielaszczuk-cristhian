export const STORAGE_KEYS = {
  SAFE_SPEED_CONFIG: 'SAFE_SPEED_CONFIG',
  SAFE_SPEED_HISTORY: 'SAFE_SPEED_HISTORY',
  SAFE_SPEED_USERS: 'SAFE_SPEED_USERS',
} as const;

/**
 * Safely retrieves and parses a value from localStorage.
 * Returns null if the key doesn't exist, parsing fails, or localStorage is unavailable.
 *
 * @param key - The storage key to retrieve
 * @returns The parsed value of type T, or null if not found/invalid
 */
export function get<T>(key: string): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to get item from localStorage with key "${key}":`, error);
    return null;
  }
}

/**
 * Safely stringifies and stores a value in localStorage.
 * Fails silently if localStorage is unavailable or storage quota is exceeded.
 *
 * @param key - The storage key to set
 * @param value - The value to store (will be JSON stringified)
 * @returns true if successful, false otherwise
 */
export function set<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage with key "${key}":`, error);
    return false;
  }
}

/**
 * Safely removes an item from localStorage.
 * Fails silently if localStorage is unavailable.
 *
 * @param key - The storage key to remove
 * @returns true if successful, false otherwise
 */
export function remove(key: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage with key "${key}":`, error);
    return false;
  }
}
