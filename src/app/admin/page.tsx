export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600">System administration and fleet management configuration</p>
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

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Safety Thresholds</h4>
            <p className="text-gray-600 text-sm">Configure speed limits, harsh braking, and other safety parameters</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Notification Settings</h4>
            <p className="text-gray-600 text-sm">Manage alert preferences and notification channels</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Export</h4>
            <p className="text-gray-600 text-sm">Export reports and fleet data for external analysis</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Integration Settings</h4>
            <p className="text-gray-600 text-sm">Configure third-party integrations and API access</p>
          </div>
        </div>
      </div>
    </div>
  );
}

