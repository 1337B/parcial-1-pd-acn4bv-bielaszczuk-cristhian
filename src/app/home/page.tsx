'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-3">
            Welcome to FleetSafety
          </h1>
          <p className="text-lg text-gray-300">
            {user ? `Hello, ${user.email}` : 'Choose your dashboard to get started'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/driver"
            className="group relative bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500 rounded-lg p-8 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-blue-600 group-hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors" aria-hidden="true">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">
                  Driver Dashboard
                </h2>
                <p className="text-sm text-gray-400">
                  Calculate safe speeds based on road conditions, weather data, and environmental factors.
                </p>
              </div>
              <div className="absolute bottom-4 right-4 text-blue-500 group-hover:text-blue-400 transition-colors" aria-hidden="true">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            href="/admin"
            className="group relative bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500 rounded-lg p-8 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 group-hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors" aria-hidden="true">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-100 mb-2">
                  Admin Settings
                </h2>
                <p className="text-sm text-gray-400">
                  Configure speed limits, road surfaces, day periods, and manage fleet-wide settings.
                </p>
              </div>
              <div className="absolute bottom-4 right-4 text-purple-500 group-hover:text-purple-400 transition-colors" aria-hidden="true">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Need help? Check out our documentation or contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

