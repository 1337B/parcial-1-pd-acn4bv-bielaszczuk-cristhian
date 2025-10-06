export default function DriverDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600">Your personal driver portal and performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Hours</h3>
          <p className="text-3xl font-bold text-blue-600">6.5</p>
          <p className="text-sm text-gray-500">of 10 hours allowed</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Safety Score</h3>
          <p className="text-3xl font-bold text-green-600">98</p>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Kilometers Driven</h3>
          <p className="text-3xl font-bold text-purple-600">397</p>
          <p className="text-sm text-gray-500">This week</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Vehicle</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Vehicle:</span> Ford Transit #247</p>
            <p><span className="font-medium">License:</span> ABC-1234</p>
            <p><span className="font-medium">Status:</span> <span className="text-green-600">Active</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Trips</h3>
          <p className="text-gray-600">Trip history</p>
        </div>
      </div>
    </div>
  );
}
