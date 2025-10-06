'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export function AppHeader() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">
          FleetSafety
        </h1>

        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
