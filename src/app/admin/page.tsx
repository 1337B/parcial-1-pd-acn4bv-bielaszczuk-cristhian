'use client';

import { useState, useEffect, useMemo } from 'react';
import { SpeedConfig, Surface, DayPeriod, SpeedRule } from '@/domain';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

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
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}

function AdminSettingsContent() {
  const [formData, setFormData] = useState<FormData>({
    baseSpeedLimit: DEFAULT_CONFIG.baseSpeedLimit.toString(),
    surface: DEFAULT_CONFIG.surface,
    dayPeriod: DEFAULT_CONFIG.dayPeriod,
    enableExternalWeather: DEFAULT_CONFIG.enableExternalWeather,
  });
  const [persistedConfig, setPersistedConfig] = useState<SpeedConfig>(DEFAULT_CONFIG);
  const [showToast, setShowToast] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    const savedConfig = get<SpeedConfig>(STORAGE_KEYS.SAFE_SPEED_CONFIG);
    if (savedConfig) {
      setPersistedConfig(savedConfig);
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

  const livePreview = useMemo(() => {
    const speedLimit = parseFloat(formData.baseSpeedLimit);

    if (isNaN(speedLimit) || speedLimit <= 0 || speedLimit > 200) {
      return null;
    }

    const rule = new SpeedRule(speedLimit, formData.surface, formData.dayPeriod);
    return rule.computeMaxSafeSpeed();
  }, [formData]);

  const hasUnsavedChanges = useMemo(() => {
    const currentConfig = {
      baseSpeedLimit: parseFloat(formData.baseSpeedLimit) || 0,
      surface: formData.surface,
      dayPeriod: formData.dayPeriod,
      enableExternalWeather: formData.enableExternalWeather,
    };

    return (
      currentConfig.baseSpeedLimit !== persistedConfig.baseSpeedLimit ||
      currentConfig.surface !== persistedConfig.surface ||
      currentConfig.dayPeriod !== persistedConfig.dayPeriod ||
      currentConfig.enableExternalWeather !== persistedConfig.enableExternalWeather
    );
  }, [formData, persistedConfig]);

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
      setPersistedConfig(config);
      setShowToast(true);
      setErrors({});
    } else {
      setErrors({ submit: 'Failed to save configuration. Please try again.' });
    }
  };

  const handleRevert = () => {
    const confirmed = confirm(
      'Are you sure you want to revert all changes? This will restore the last saved configuration.'
    );

    if (confirmed) {
      setFormData({
        baseSpeedLimit: persistedConfig.baseSpeedLimit.toString(),
        surface: persistedConfig.surface,
        dayPeriod: persistedConfig.dayPeriod,
        enableExternalWeather: persistedConfig.enableExternalWeather,
      });
      setErrors({});
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">System administration and fleet management configuration</p>
      </div>

      {/* Success Toast */}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Speed Configuration</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Base Speed Limit */}
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

            {/* Surface Type */}
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

            {/* Day Period */}
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

            {/* Enable External Weather */}
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

            {/* Form Errors */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between">
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Reset to Defaults
                </button>

                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md shadow-sm hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    Revert Changes
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Live Preview</h3>

          {livePreview !== null ? (
            <div className="space-y-4">
              {/* Speed Display */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-500 mb-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{livePreview}</div>
                    <div className="text-xs text-blue-700">km/h</div>
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Max Safe Speed</h4>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600 mt-1">⚠ Unsaved changes</p>
                )}
              </div>

              {/* Applied Factors */}
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-2">Applied Factors</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Speed Limit:</span>
                    <span className="font-medium">{formData.baseSpeedLimit} km/h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Surface Factor:</span>
                    <span className="font-medium">×{getSurfaceFactor(formData.surface)} ({formData.surface})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Day Period Factor:</span>
                    <span className="font-medium">×{getDayPeriodFactor(formData.dayPeriod)} ({formData.dayPeriod})</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">External Weather:</span>
                    <span className="font-medium">{formData.enableExternalWeather ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h6 className="text-xs font-medium text-gray-700 mb-1">Calculation</h6>
                <p className="text-xs text-gray-600">
                  {formData.baseSpeedLimit} × {getSurfaceFactor(formData.surface)} × {getDayPeriodFactor(formData.dayPeriod)} = {livePreview} km/h
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Enter a valid speed limit to see preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Admin Sections */}
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
