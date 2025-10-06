'use client';

import { useState, useEffect } from 'react';
import { SpeedConfig, Surface, DayPeriod } from '@/domain';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';

interface FormData {
  baseSpeedLimit: string;
  surface: Surface;
  dayPeriod: DayPeriod;
  enableExternalWeather: boolean;
}

const DEFAULT_CONFIG: SpeedConfig = {
  baseSpeedLimit: 50,
  surface: Surface.asphalt,
  dayPeriod: DayPeriod.day,
  enableExternalWeather: true,
};

export default function AdminSettings() {
  const [formData, setFormData] = useState<FormData>({
    baseSpeedLimit: DEFAULT_CONFIG.baseSpeedLimit.toString(),
    surface: DEFAULT_CONFIG.surface,
    dayPeriod: DEFAULT_CONFIG.dayPeriod,
    enableExternalWeather: DEFAULT_CONFIG.enableExternalWeather,
  });
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedConfig = get<SpeedConfig>(STORAGE_KEYS.SAFE_SPEED_CONFIG);
    if (savedConfig) {
      setFormData({
        baseSpeedLimit: savedConfig.baseSpeedLimit.toString(),
        surface: savedConfig.surface,
        dayPeriod: savedConfig.dayPeriod,
        enableExternalWeather: savedConfig.enableExternalWeather,
      });
    }
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const speedLimit = parseFloat(formData.baseSpeedLimit);
    if (isNaN(speedLimit) || speedLimit <= 0 || speedLimit > 200) {
      newErrors.baseSpeedLimit = 'Speed limit must be a number between 1 and 200 km/h';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const config: SpeedConfig = {
      baseSpeedLimit: parseFloat(formData.baseSpeedLimit),
      surface: formData.surface,
      dayPeriod: formData.dayPeriod,
      enableExternalWeather: formData.enableExternalWeather,
    };

    const success = set(STORAGE_KEYS.SAFE_SPEED_CONFIG, config);

    if (success) {
      setShowToast(true);
      setErrors({});
    } else {
      setErrors({ submit: 'Failed to save configuration. Please try again.' });
    }
  };

  const handleReset = () => {
    const confirmed = confirm(
      'Are you sure you want to reset to default configuration? This will overwrite your current settings.'
    );

    if (confirmed) {
      setFormData({
        baseSpeedLimit: DEFAULT_CONFIG.baseSpeedLimit.toString(),
        surface: DEFAULT_CONFIG.surface,
        dayPeriod: DEFAULT_CONFIG.dayPeriod,
        enableExternalWeather: DEFAULT_CONFIG.enableExternalWeather,
      });
      setErrors({});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">System administration and fleet management configuration</p>
      </div>

      {showToast && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Configuration saved successfully!</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Speed Configuration</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="baseSpeedLimit" className="block text-sm font-medium text-gray-700 mb-2">
              Base Speed Limit (km/h)
            </label>
            <input
              type="number"
              id="baseSpeedLimit"
              value={formData.baseSpeedLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, baseSpeedLimit: e.target.value }))}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.baseSpeedLimit ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="50"
              min="1"
              max="200"
            />
            {errors.baseSpeedLimit && (
              <p className="mt-1 text-sm text-red-600">{errors.baseSpeedLimit}</p>
            )}
          </div>

          <div>
            <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-2">
              Road Surface
            </label>
            <select
              id="surface"
              value={formData.surface}
              onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value as Surface }))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={Surface.asphalt}>Asphalt</option>
              <option value={Surface.gravel}>Gravel</option>
              <option value={Surface.dirt}>Dirt</option>
            </select>
          </div>

          <div>
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">Day Period</legend>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="day"
                    type="radio"
                    value={DayPeriod.day}
                    checked={formData.dayPeriod === DayPeriod.day}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayPeriod: e.target.value as DayPeriod }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="day" className="ml-2 text-sm text-gray-700">Day</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="night"
                    type="radio"
                    value={DayPeriod.night}
                    checked={formData.dayPeriod === DayPeriod.night}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayPeriod: e.target.value as DayPeriod }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="night" className="ml-2 text-sm text-gray-700">Night</label>
                </div>
              </div>
            </fieldset>
          </div>

          <div className="flex items-center">
            <input
              id="enableExternalWeather"
              type="checkbox"
              checked={formData.enableExternalWeather}
              onChange={(e) => setFormData(prev => ({ ...prev, enableExternalWeather: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableExternalWeather" className="ml-2 text-sm text-gray-700">
              Enable External Weather Integration
            </label>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>

            <button
              type="submit"
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Active Drivers</span>
              <span className="font-semibold">24</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Admin Users</span>
              <span className="font-semibold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Pending Invites</span>
              <span className="font-semibold">2</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Total Vehicles</span>
              <span className="font-semibold">32</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Active Routes</span>
              <span className="font-semibold">18</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Maintenance Due</span>
              <span className="font-semibold text-yellow-600">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
