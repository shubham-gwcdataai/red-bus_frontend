import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, HelpCircle, User, LogOut } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const NAV_ITEMS = [
    { path: '/', label: 'Home', Icon: Home },
    { path: '/my-bookings', label: 'Bookings', Icon: BookOpen },
    { path: '/#faq', label: 'Help', Icon: HelpCircle },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path.split('#')[0]) && path !== '/';
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      {/* Dynamic grid-cols based on item count to maintain responsiveness */}
      <div className={cn(
        "grid h-16 safe-area-inset-bottom w-full",
        isAuthenticated ? "grid-cols-5" : "grid-cols-4"
      )}>
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95"
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-150',
                    active ? 'text-[#d63031]' : 'text-gray-400'
                  )}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#d63031]" />
                )}
              </div>
              <span className={cn(
                'text-[10px] font-semibold transition-colors duration-150',
                active ? 'text-[#d63031]' : 'text-gray-400'
              )}>
                {label}
              </span>
            </Link>
          );
        })}

        {/* Conditional Account/Logout Logic */}
        {!isAuthenticated ? (
          <Link
            to="/login"
            className="flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95"
          >
            <User className="w-5 h-5 text-gray-400" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold text-gray-400">Login</span>
          </Link>
        ) : (
          <>
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95"
            >
              <User 
                className={cn('w-5 h-5', pathname === '/profile' ? 'text-[#d63031]' : 'text-gray-400')} 
                strokeWidth={pathname === '/profile' ? 2.5 : 1.8} 
              />
              <span className={cn('text-[10px] font-semibold', pathname === '/profile' ? 'text-[#d63031]' : 'text-gray-400')}>
                Account
              </span>
            </Link>
            <button
              onClick={logout}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95 text-gray-400 hover:text-red-500"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.8} />
              <span className="text-[10px] font-semibold">Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default BottomNav;