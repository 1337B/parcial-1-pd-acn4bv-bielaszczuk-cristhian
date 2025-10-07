'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeatherSnapshot } from '@/domain';
import { OpenMeteoClient, WeatherApiError } from '@/services/weather';
import { get, STORAGE_KEYS } from '@/lib/storage/safeStorage';

interface UseWeatherState {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
  isOffline: boolean;
}

interface UseWeatherReturn extends UseWeatherState {
  refresh: () => void;
}

function getLastKnownWeather(): WeatherSnapshot | null {
  try {
    const history = get<any[]>(STORAGE_KEYS.SAFE_SPEED_HISTORY) || [];

    for (const entry of history) {
      if (entry.weatherSnapshot) {
        return entry.weatherSnapshot;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Custom hook for fetching and managing weather data with offline support.
 *
 * @param lat - Latitude coordinate
 * @param lon - Longitude coordinate
 * @param enabled - Whether to fetch weather data (default: true)
 * @returns Object containing data, loading, error states and refresh function
 */
export function useWeather(
  lat: number | null,
  lon: number | null,
  enabled: boolean = true
): UseWeatherReturn {
  const [state, setState] = useState<UseWeatherState>({
    data: null,
    loading: false,
    error: null,
    isOffline: false,
  });

  const isOffline = useCallback((): boolean => {
    return typeof navigator !== 'undefined' && navigator.onLine === false;
  }, []);

  const fetchWeather = useCallback(async () => {
    if (!enabled || lat === null || lon === null) {
      return;
    }

    if (isOffline()) {
      const lastKnownWeather = getLastKnownWeather();

      setState({
        data: lastKnownWeather,
        loading: false,
        error: 'offline',
        isOffline: true,
      });
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isOffline: false
    }));

    try {
      const weatherData = await OpenMeteoClient.getCurrentWeather(lat, lon);
      setState({
        data: weatherData,
        loading: false,
        error: null,
        isOffline: false,
      });
    } catch (error) {
      let errorMessage: string;
      let fallbackData: WeatherSnapshot | null = null;

      if (error instanceof WeatherApiError) {
        if (error.statusCode === undefined ||
            (error.statusCode >= 500 && error.statusCode < 600) ||
            error.message.toLowerCase().includes('network') ||
            error.message.toLowerCase().includes('fetch')) {

          errorMessage = 'offline';
          fallbackData = getLastKnownWeather();
        } else {
          errorMessage = error.message;
        }
      } else {
        errorMessage = 'offline';
        fallbackData = getLastKnownWeather();
      }

      setState({
        data: fallbackData,
        loading: false,
        error: errorMessage,
        isOffline: errorMessage === 'offline',
      });
    }
  }, [lat, lon, enabled, isOffline]);


  const refresh = useCallback(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    const handleOnline = () => {
      if (enabled && lat !== null && lon !== null) {
        fetchWeather();
      }
    };

    const handleOffline = () => {
      if (state.loading) {
        const lastKnownWeather = getLastKnownWeather();
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'offline',
          isOffline: true,
          data: lastKnownWeather || prev.data,
        }));
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [enabled, lat, lon, fetchWeather, state.loading]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    isOffline: state.isOffline,
    refresh,
  };
}
