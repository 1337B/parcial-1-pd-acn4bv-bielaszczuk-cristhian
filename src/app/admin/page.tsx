'use client';

import { useState, useEffect, useMemo } from 'react';
import { SpeedConfig, Surface, DayPeriod, SpeedRule } from '@/domain';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { surfaceLabel, surfaceFactor } from '@/lib/mappers/surfaceLabel';
import { dayPeriodLabel, dayPeriodFactor } from '@/lib/mappers/dayPeriodLabel';

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

  return (
    <div className="space-y-6">
      <a href="#config-form" className="skip-to-main">
        Skip to configuration form
      </a>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">Admin Settings</h1>
        <p className="text-gray-300 mt-1">System administration and fleet management configuration</p>
      </div>

      {showToast && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4" role="alert" aria-live="polite">
          <div className="flex">
            <div className="flex-shrink-0" aria-hidden="true">
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
        <section className="bg-white p-4 md:p-6 rounded-lg shadow" id="config-form" aria-labelledby="config-heading">
          <h2 id="config-heading" className="text-lg font-semibold text-gray-900 mb-6">Speed Configuration</h2>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="baseSpeedLimit" className="block text-sm font-medium text-gray-700 mb-2">
                Base Speed Limit (km/h) <span className="text-red-500" aria-label="required">*</span>
              </label>
              <input
                type="number"
                id="baseSpeedLimit"
                name="baseSpeedLimit"
                value={formData.baseSpeedLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, baseSpeedLimit: e.target.value }))}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.baseSpeedLimit ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="50"
                min="1"
                max="200"
                aria-invalid={!!errors.baseSpeedLimit}
                aria-describedby={errors.baseSpeedLimit ? 'speed-limit-error' : 'speed-limit-description'}
                required
              />
              <p id="speed-limit-description" className="sr-only">Enter a base speed limit between 1 and 200 km/h</p>
              {errors.baseSpeedLimit && (
                <p id="speed-limit-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.baseSpeedLimit}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-2">
                Road Surface <span className="text-red-500" aria-label="required">*</span>
              </label>
              <select
                id="surface"
                name="surface"
                value={formData.surface}
                onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value as Surface }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-describedby="surface-description"
                required
              >
                <option value={Surface.asphalt}>{surfaceLabel(Surface.asphalt)}</option>
                <option value={Surface.gravel}>{surfaceLabel(Surface.gravel)}</option>
                <option value={Surface.dirt}>{surfaceLabel(Surface.dirt)}</option>
              </select>
              <p id="surface-description" className="sr-only">Select the road surface type</p>
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-gray-700 mb-2">
                Day Period <span className="text-red-500" aria-label="required">*</span>
              </legend>
              <div className="space-y-2" role="radiogroup" aria-required="true">
                <div className="flex items-center">
                  <input
                    id="day"
                    name="dayPeriod"
                    type="radio"
                    value={DayPeriod.day}
                    checked={formData.dayPeriod === DayPeriod.day}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayPeriod: e.target.value as DayPeriod }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="day" className="ml-2 text-sm text-gray-700">{dayPeriodLabel(DayPeriod.day)}</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="night"
                    name="dayPeriod"
                    type="radio"
                    value={DayPeriod.night}
                    checked={formData.dayPeriod === DayPeriod.night}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayPeriod: e.target.value as DayPeriod }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="night" className="ml-2 text-sm text-gray-700">{dayPeriodLabel(DayPeriod.night)}</label>
                </div>
              </div>
            </fieldset>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="enableExternalWeather"
                  name="enableExternalWeather"
                  type="checkbox"
                  checked={formData.enableExternalWeather}
                  onChange={(e) => setFormData(prev => ({ ...prev, enableExternalWeather: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  aria-describedby="external-weather-description"
                />
              </div>
              <div className="ml-3">
                <label htmlFor="enableExternalWeather" className="text-sm font-medium text-gray-700">
                  Enable External Weather Integration
                </label>
                <p id="external-weather-description" className="text-xs text-gray-500">
                  Allow drivers to use real-time weather data in their calculations
                </p>
              </div>
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Reset to Defaults
                </button>

                {hasUnsavedChanges && (
                  <button
                    type="button"
                    onClick={handleRevert}
                    className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md shadow-sm hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                    aria-label="Revert to last saved configuration"
                  >
                    Revert Changes
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Save configuration changes"
              >
                Save Configuration
              </button>
            </div>
          </form>
        </section>

        <section className="bg-white p-4 md:p-6 rounded-lg shadow" aria-labelledby="preview-heading" aria-live="polite">
          <h2 id="preview-heading" className="text-lg font-semibold text-gray-900 mb-6">Live Preview</h2>

          {livePreview !== null ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 border-4 border-blue-500 mb-3" aria-hidden="true">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{livePreview}</div>
                    <div className="text-xs text-blue-700">km/h</div>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Max Safe Speed</h3>
                <p className="sr-only">Preview: Maximum safe speed would be {livePreview} kilometers per hour</p>
                {hasUnsavedChanges && (
                  <p className="text-sm text-amber-600 mt-1" role="status">⚠ Unsaved changes</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Applied Factors</h4>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Base Speed Limit:</dt>
                    <dd className="font-medium">{formData.baseSpeedLimit} km/h</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Surface Factor:</dt>
                    <dd className="font-medium">×{surfaceFactor(formData.surface)} ({surfaceLabel(formData.surface)})</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Day Period Factor:</dt>
                    <dd className="font-medium">×{dayPeriodFactor(formData.dayPeriod)} ({dayPeriodLabel(formData.dayPeriod)})</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">External Weather:</dt>
                    <dd className="font-medium">{formData.enableExternalWeather ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h5 className="text-xs font-medium text-gray-700 mb-1">Calculation</h5>
                <p className="text-xs text-gray-600">
                  {formData.baseSpeedLimit} × {surfaceFactor(formData.surface)} × {dayPeriodFactor(formData.dayPeriod)} = {livePreview} km/h
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8" role="status">
              <div className="text-gray-400 mb-2" aria-hidden="true">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">Enter a valid speed limit to see preview</p>
            </div>
          )}
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white p-4 md:p-6 rounded-lg shadow" aria-labelledby="users-heading">
          <h2 id="users-heading" className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt>Active Drivers</dt>
              <dd className="font-semibold">24</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt>Admin Users</dt>
              <dd className="font-semibold">3</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt>Pending Invites</dt>
              <dd className="font-semibold">2</dd>
            </div>
          </dl>
        </section>

        <section className="bg-white p-4 md:p-6 rounded-lg shadow" aria-labelledby="fleet-heading">
          <h2 id="fleet-heading" className="text-lg font-semibold text-gray-900 mb-4">Fleet Overview</h2>
          <dl className="space-y-3">
            <div className="flex justify-between items-center">
              <dt>Total Vehicles</dt>
              <dd className="font-semibold">32</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt>Active Routes</dt>
              <dd className="font-semibold">18</dd>
            </div>
            <div className="flex justify-between items-center">
              <dt>Maintenance Due</dt>
              <dd className="font-semibold text-yellow-600">4</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
