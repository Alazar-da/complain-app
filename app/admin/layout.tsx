'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FiLock, FiClock, FiArrowRight } from 'react-icons/fi';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [tokenChecked, setTokenChecked] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Hide sidebar on login and register routes
  const hideSidebar = ['/admin/login', '/admin/register'].includes(pathname);

  useEffect(() => {
    // Skip token check on login and register pages
    if (hideSidebar) {
      setTokenChecked(true);
      return;
    }

    const storedToken = localStorage.getItem('adminToken');

    if (!storedToken) {
      // Start redirect countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.replace('/admin/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setToken(null);
      setTokenChecked(true);

      return () => clearInterval(interval);
    }

    // If token exists
    setToken(storedToken);
    setTokenChecked(true);

  }, [hideSidebar, router]);

  // Prevent UI flicker before token check finishes
  if (!tokenChecked) return null;

  // Show LOCK SCREEN only when:
  // - No token
  // - Not in login or register
  if (!token && !hideSidebar) {
    return (
      <main className="fixed inset-0 bg-linear-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform transition-all duration-300 animate-scale-in">

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-8 h-8 text-red-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600 mb-4">Authentication required to view this page.</p>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <FiClock className="w-5 h-5 text-blue-600 animate-pulse" />
              <span className="text-sm text-gray-500">
                Redirecting in{' '}
                <span className="font-mono font-bold text-blue-600 text-lg">
                  {countdown}
                </span>
                ...
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-linear-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${((3 - countdown) / 3) * 100}%` }}
              ></div>
            </div>

            <p className="text-xs text-gray-500">
              You will be automatically redirected
            </p>
          </div>

          <div className="flex space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={() => router.replace('/admin/login')}
              className="flex-1 bg-linear-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <span>Login Now</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </main>
    );
  }

  // Normal layout
  return (
    <div className="flex min-h-screen relative">
      {!hideSidebar && <AdminSidebar />}
      <main className="flex-1 bg-gray-100 max-h-screen overflow-y-auto w-full">
        {children}
      </main>
  </div>
  );
}
