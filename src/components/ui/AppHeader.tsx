import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">
          FleetSafety
        </h1>

        <nav className="flex items-center space-x-6">
          <Link
            href="/settings"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Settings
          </Link>
          <Link
            href="/driver"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Driver
          </Link>
        </nav>
      </div>
    </header>
  );
}
