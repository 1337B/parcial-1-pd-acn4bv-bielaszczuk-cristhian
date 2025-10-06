'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeatherSnapshot } from '@/domain';
import { OpenMeteoClient, WeatherApiError } from '@/services/weather';

interface UseWeatherState {
  data: WeatherSnapshot | null;
  loading: boolean;
  error: string | null;
}

interface UseWeatherReturn extends UseWeatherState {
  refresh: () => void;
}

/**
 * Custom hook for fetching and managing weather data.
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
  });

  const fetchWeather = useCallback(async () => {
    if (!enabled || lat === null || lon === null) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const weatherData = await OpenMeteoClient.getCurrentWeather(lat, lon);
      setState({
        data: weatherData,
        loading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof WeatherApiError
        ? error.message
        : 'Failed to fetch weather data';

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [lat, lon, enabled]);

  const refresh = useCallback(() => {
    fetchWeather();
  }, [fetchWeather]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refresh,
  };
}
