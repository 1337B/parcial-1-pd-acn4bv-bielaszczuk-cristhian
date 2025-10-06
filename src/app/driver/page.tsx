'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SpeedConfig, SpeedRule, Surface, DayPeriod, WeatherSnapshot } from '@/domain';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';
import { useWeather } from '@/hooks';

interface LocationInputs {
  lat: string;
  lon: string;
}

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

// Locacion random solo para testeo
const DEFAULT_LOCATION: LocationInputs = {
  lat: '45.5017',
  lon: '-73.5673'
};

export default function DriverDashboard() {
  const [config, setConfig] = useState<SpeedConfig | null>(null);
  const [location, setLocation] = useState<LocationInputs>(DEFAULT_LOCATION);
  const [useExternalWeather, setUseExternalWeather] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [history, setHistory] = useState<SpeedHistoryEntry[]>([]);

  const { data: weatherData, loading: weatherLoading, error: weatherError } = useWeather(
    useExternalWeather ? parseFloat(location.lat) : null,
    useExternalWeather ? parseFloat(location.lon) : null,
    useExternalWeather
  );

  useEffect(() => {
    const savedConfig = get<SpeedConfig>(STORAGE_KEYS.SAFE_SPEED_CONFIG);
    setConfig(savedConfig);
  }, []);

  useEffect(() => {
    const savedHistory = get<SpeedHistoryEntry[]>(STORAGE_KEYS.SAFE_SPEED_HISTORY) || [];
    setHistory(savedHistory);
  }, []);

  const handleRecalculate = () => {
    if (!config) return;

    setIsCalculating(true);

    const rule = new SpeedRule(
      config.baseSpeedLimit,
      config.surface,
      config.dayPeriod,
      useExternalWeather && config.enableExternalWeather ? weatherData || undefined : undefined
    );

    const surfaceFactor = getSurfaceFactor(config.surface);
    const dayPeriodFactor = getDayPeriodFactor(config.dayPeriod);
    const precipitationFactor = useExternalWeather && weatherData ? getPrecipitationFactor(weatherData.precipitationType) : undefined;
    const windFactor = useExternalWeather && weatherData && weatherData.windKph > 40 ? 0.9 : undefined;

    const computedMax = rule.computeMaxSafeSpeed();

    const result: CalculationResult = {
      maxSafeSpeed: computedMax,
      factors: {
        surface: surfaceFactor,
        dayPeriod: dayPeriodFactor,
        precipitation: precipitationFactor,
        wind: windFactor,
      }
    };

    const historyEntry: SpeedHistoryEntry = {
      timestampISO: new Date().toISOString(),
      configSnapshot: { ...config },
      weatherSnapshot: useExternalWeather && config.enableExternalWeather && weatherData ? { ...weatherData } : undefined,
      computedMax: computedMax,
    };

    const updatedHistory = [historyEntry, ...history];
    setHistory(updatedHistory);
    set(STORAGE_KEYS.SAFE_SPEED_HISTORY, updatedHistory);

    setCalculationResult(result);
    setIsCalculating(false);
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

  const getSafetyStatus = (entry: SpeedHistoryEntry, currentSpeed: number = 45): 'safe' | 'caution' => {
    return currentSpeed <= entry.computedMax ? 'safe' : 'caution';
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

  const getSurfaceFactor = (surface: Surface): number => {
    switch (surface) {
      case Surface.asphalt: return 1.0;
      case Surface.gravel: return 0.8;
      case Surface.dirt: return 0.7;
      default: return 1.0;
    }
  };

  const getDayPeriodFactor = (dayPeriod: DayPeriod): number => {
    return dayPeriod === DayPeriod.day ? 1.0 : 0.9;
  };

  const getPrecipitationFactor = (precipitationType: string): number => {
    switch (precipitationType) {
      case 'none': return 1.0;
      case 'rain': return 0.85;
      case 'snow': return 0.7;
      default: return 1.0;
    }
  };

  if (config === null) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Your personal driver portal and speed calculator</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Configuration Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>No speed configuration found. Please set up the system configuration first.</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/admin"
                  className="bg-yellow-100 px-3 py-2 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-200"
                >
                  Go to Admin Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600">Your personal driver portal and speed calculator</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Safe Speed Calculator</h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Location</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    id="lat"
                    step="any"
                    value={location.lat}
                    onChange={(e) => setLocation(prev => ({ ...prev, lat: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lon" className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    id="lon"
                    step="any"
                    value={location.lon}
                    onChange={(e) => setLocation(prev => ({ ...prev, lon: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="useExternalWeather"
                type="checkbox"
                checked={useExternalWeather}
                onChange={(e) => setUseExternalWeather(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="useExternalWeather" className="ml-2 text-sm text-gray-700">
                Use external weather data
              </label>
            </div>

            {useExternalWeather && weatherError && (
              <div className="text-sm text-red-600">
                Weather error: {weatherError}
              </div>
            )}

            <button
              onClick={handleRecalculate}
              disabled={isCalculating || (useExternalWeather && weatherLoading)}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {isCalculating || (useExternalWeather && weatherLoading) ? 'Calculating...' : 'Recalculate'}
            </button>
          </div>

          <div className="space-y-4">
            {calculationResult && (
              <>
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 border-gray-200 flex items-center justify-center">
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                        calculationResult.maxSafeSpeed >= 50 ? 'bg-green-100 border-4 border-green-500' :
                        calculationResult.maxSafeSpeed >= 30 ? 'bg-yellow-100 border-4 border-yellow-500' :
                        'bg-red-100 border-4 border-red-500'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{calculationResult.maxSafeSpeed}</div>
                          <div className="text-xs text-gray-600">km/h</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mt-3">Max Safe Speed</h4>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Applied Factors</h5>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Surface: ×{calculationResult.factors.surface}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {config.dayPeriod}: ×{calculationResult.factors.dayPeriod}
                    </span>
                    {calculationResult.factors.precipitation && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Weather: ×{calculationResult.factors.precipitation}
                      </span>
                    )}
                    {calculationResult.factors.wind && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Strong Wind: ×{calculationResult.factors.wind}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Base Speed Limit</dt>
            <dd className="text-lg font-semibold text-gray-900">{config.baseSpeedLimit} km/h</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Surface</dt>
            <dd className="text-lg font-semibold text-gray-900 capitalize">{config.surface}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Day Period</dt>
            <dd className="text-lg font-semibold text-gray-900 capitalize">{config.dayPeriod}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">External Weather</dt>
            <dd className="text-lg font-semibold text-gray-900">{config.enableExternalWeather ? 'Enabled' : 'Disabled'}</dd>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Calculation History</h3>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-1 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Clear History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No calculations yet. Use the calculator above to start tracking your speed calculations.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {history.map((entry, index) => {
              const safetyStatus = getSafetyStatus(entry);
              return (
                <div
                  key={entry.timestampISO}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        safetyStatus === 'safe' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {safetyStatus === 'safe' ? 'Safe' : 'Caution'}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Max Speed: {entry.computedMax} km/h
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTimestamp(entry.timestampISO)} •
                        {entry.configSnapshot.surface} •
                        {entry.configSnapshot.dayPeriod}
                        {entry.weatherSnapshot && (
                          <> • {entry.weatherSnapshot.precipitationType} • {entry.weatherSnapshot.windKph} km/h wind</>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{entry.computedMax}</div>
                      <div className="text-xs text-gray-500">km/h</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
