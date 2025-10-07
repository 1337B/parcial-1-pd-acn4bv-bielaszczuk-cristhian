export function WeatherSkeleton() {
  return (
    <div className="space-y-2" role="status" aria-live="polite" aria-label="Loading weather data">
      <div className="h-4 bg-gray-200 rounded skeleton w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded skeleton w-1/2"></div>
      <span className="sr-only">Loading weather information...</span>
    </div>
  );
}

export function SpeedResultSkeleton() {
  return (
    <div className="flex flex-col items-center" role="status" aria-live="polite">
      <div className="w-32 h-32 rounded-full bg-gray-200 skeleton mb-3"></div>
      <div className="h-6 bg-gray-200 rounded skeleton w-40 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded skeleton w-32"></div>
      <span className="sr-only">Calculating safe speed...</span>
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="h-5 bg-gray-200 rounded skeleton w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded skeleton w-2/3"></div>
        </div>
      ))}
      <span className="sr-only">Loading calculation history...</span>
    </div>
  );
}

