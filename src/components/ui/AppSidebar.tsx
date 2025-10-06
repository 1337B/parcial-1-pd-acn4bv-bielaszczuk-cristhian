import Link from 'next/link';

export function AppSidebar() {
  return (
    <aside className="bg-gray-800 border-r border-gray-700 w-64 min-h-screen">
      <div className="p-6">
        <nav className="space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/vehicles"
            className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Vehicles
          </Link>
          <Link
            href="/drivers"
            className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Drivers
          </Link>
          <Link
            href="/reports"
            className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Reports
          </Link>
          <Link
            href="/safety"
            className="flex items-center px-3 py-2 text-gray-300 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
          >
            Safety Alerts
          </Link>
        </nav>
      </div>
    </aside>
  );
}
