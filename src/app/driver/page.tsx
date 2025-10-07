'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SpeedConfig, SpeedRule, WeatherSnapshot } from '@/domain';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';
import { useWeather } from '@/hooks';
import { surfaceLabel, surfaceFactor, dayPeriodLabel, dayPeriodFactor, precipitationLabel, precipitationFactor } from '@/lib/mappers';
import { WeatherSkeleton, EmptyState } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CalculationResult {
  maxSafeSpeed: number;
  factors: {
    surface: number;
    dayPeriod: number;
    precipitation?: number;
    wind?: number;
  };
}

interface SpeedHistoryEntry {
  timestampISO: string;
  configSnapshot: SpeedConfig;
  weatherSnapshot?: WeatherSnapshot;
  computedMax: number;
}

export default function DriverDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState<SpeedConfig | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [history, setHistory] = useState<SpeedHistoryEntry[]>([]);
  const [currentSpeed] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConfig = get<SpeedConfig>(STORAGE_KEYS.SAFE_SPEED_CONFIG);
    setConfig(savedConfig);
  }, []);

  const { data: weatherData, loading: weatherLoading, error: weatherError, isOffline } = useWeather(
    config?.defaultLocation?.lat || null,
    config?.defaultLocation?.lon || null,
    !!config?.defaultLocation
  );

  useEffect(() => {
    const savedHistory = get<SpeedHistoryEntry[]>(STORAGE_KEYS.SAFE_SPEED_HISTORY) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    if (config && weatherData && !isRefreshing) {
      handleRefresh();
    }
  }, [config, weatherData]);

  const handleRefresh = async () => {
    if (!config) return;

    setIsRefreshing(true);

    const rule = new SpeedRule(
      config.baseSpeedLimit,
      config.surface,
      config.dayPeriod,
      weatherData || undefined
    );

    const surfaceFactorValue = surfaceFactor(config.surface);
    const dayPeriodFactorValue = dayPeriodFactor(config.dayPeriod);
    const precipitationFactorValue = weatherData ? precipitationFactor(weatherData.precipitationType) : undefined;
    const windFactor = weatherData && weatherData.windKph > 40 ? 0.9 : undefined;

    const computedMax = rule.computeMaxSafeSpeed();

    const result: CalculationResult = {
      maxSafeSpeed: computedMax,
      factors: {
        surface: surfaceFactorValue,
        dayPeriod: dayPeriodFactorValue,
        precipitation: precipitationFactorValue,
        wind: windFactor,
      }
    };

    const historyEntry: SpeedHistoryEntry = {
      timestampISO: new Date().toISOString(),
      configSnapshot: { ...config },
      weatherSnapshot: weatherData ? { ...weatherData } : undefined,
      computedMax: computedMax,
    };

    const updatedHistory = [historyEntry, ...history];
    setHistory(updatedHistory);
    set(STORAGE_KEYS.SAFE_SPEED_HISTORY, updatedHistory);

    setCalculationResult(result);
    setIsRefreshing(false);

    setTimeout(() => {
      resultRef.current?.focus();
    }, 100);
  };

  const handleClearHistory = () => {
    const confirmed = confirm(
      'Are you sure you want to clear all speed calculation history? This action cannot be undone.'
    );

    if (confirmed) {
      setHistory([]);
      set(STORAGE_KEYS.SAFE_SPEED_HISTORY, []);
    }
  };

  const getSpeedColor = (): string => {
    return 'bg-blue-100 border-4 border-blue-500';
  };

  const formatTimestamp = (timestampISO: string): string => {
    const date = new Date(timestampISO);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (config === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Driver Dashboard</h1>
          <p className="text-gray-300 mt-1">Your personal driver portal and speed calculator</p>
        </div>

        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-100 mb-2">Configuration Required</h2>
            <p className="text-gray-300 mb-6">
              Please ask your administrator to set up FleetSafety parameters.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Driver Dashboard</h1>
        <p className="text-gray-300 mt-1">
          <svg className="inline w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Read-only view - Configuration managed by admin
        </p>
      </div>

      {isOffline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="flex-shrink-0" aria-hidden="true">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800">Weather Service Offline</h3>
              <div className="mt-1 text-sm text-orange-700">
                <p>
                  Unable to fetch current weather data.
                  {weatherData ? ' Using last known weather data for calculations.' : ' Weather factors will not be applied to speed calculations.'}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              <svg className="inline w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Location & Speed
            </h2>
          </div>

          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-500">Location</dt>
              <dd className="text-sm text-gray-900">
                Latitude: {config.defaultLocation?.lat} | Longitude: {config.defaultLocation?.lon}
              </dd>
            </div>
            <div className="flex justify-between items-center">
              <dt className="text-sm font-medium text-gray-500">Current Speed (km/h)</dt>
              <dd className="text-sm text-gray-900 font-semibold">{currentSpeed}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || weatherLoading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isRefreshing || weatherLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          {!calculationResult && !isRefreshing ? (
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Ready to Calculate"
              description="Click 'Refresh' to calculate the maximum safe speed for current conditions."
              action={undefined}
            />
          ) : calculationResult ? (
            <div
              ref={resultRef}
              tabIndex={-1}
              role="region"
              aria-live="polite"
              aria-label="Speed calculation result"
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center" aria-hidden="true">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                      getSpeedColor()
                    }`}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{calculationResult.maxSafeSpeed}</div>
                        <div className="text-xs text-gray-600">km/h</div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-3">Max Safe Speed</h3>
                <p className="sr-only">
                  Maximum safe speed is {calculationResult.maxSafeSpeed} kilometers per hour.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Factors</h4>
                <div className="flex flex-wrap gap-2" role="list">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800" role="listitem">
                    Surface: ×{calculationResult.factors.surface}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800" role="listitem">
                    {dayPeriodLabel(config.dayPeriod)}: ×{calculationResult.factors.dayPeriod}
                  </span>
                  {calculationResult.factors.precipitation && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800" role="listitem">
                      Weather: ×{calculationResult.factors.precipitation}
                    </span>
                  )}
                  {calculationResult.factors.wind && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" role="listitem">
                      Strong Wind: ×{calculationResult.factors.wind}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {weatherLoading && (
        <div aria-live="polite" aria-busy="true">
          <WeatherSkeleton />
        </div>
      )}

      {weatherError && !isOffline && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="flex-shrink-0" aria-hidden="true">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Weather Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{weatherError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {weatherData && !weatherLoading && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              <svg className="inline w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Current Weather
            </h2>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-500">Temperature</dt>
              <dd className="text-gray-900">{weatherData.tempC}°C</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Conditions</dt>
              <dd className="text-gray-900">{precipitationLabel(weatherData.precipitationType)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Precipitation</dt>
              <dd className="text-gray-900">{weatherData.precipitationMm} mm</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Wind Speed</dt>
              <dd className="text-gray-900">{weatherData.windKph} km/h</dd>
            </div>
          </dl>

          <p className="text-xs text-gray-500 mt-4">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}

      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <svg className="inline w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Current Configuration
          </h2>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Base Speed Limit</dt>
            <dd className="text-gray-900">{config.baseSpeedLimit} km/h</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Road Surface</dt>
            <dd className="text-gray-900">{surfaceLabel(config.surface)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Day Period</dt>
            <dd className="text-gray-900">{dayPeriodLabel(config.dayPeriod)}</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-500">Weather Integration</dt>
            <dd className="text-gray-900">Always Enabled</dd>
          </div>
        </dl>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Calculation History</h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-sm text-red-600 hover:text-red-700 focus:outline-none focus:underline"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No calculations yet. Click Refresh to start.</p>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div key={entry.timestampISO} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    Max: {entry.computedMax} km/h
                  </span>
                  <span className="text-xs text-gray-500">{formatTimestamp(entry.timestampISO)}</span>
                </div>
                {entry.weatherSnapshot && (
                  <p className="text-xs text-gray-600 mt-1">
                    Weather: {precipitationLabel(entry.weatherSnapshot.precipitationType)}, {entry.weatherSnapshot.tempC}°C
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
