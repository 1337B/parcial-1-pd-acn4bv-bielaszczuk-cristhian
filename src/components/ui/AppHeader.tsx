'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { BackButton } from './BackButton';

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const showBackButton = pathname !== '/home' && pathname !== '/';

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          {showBackButton && <BackButton />}
          <h1 className="text-xl md:text-2xl font-semibold text-white">
            FleetSafety
          </h1>
        </div>

        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-200">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-200 hover:text-gray-100 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-200 hover:text-gray-100 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
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
