import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, HelpCircle, User } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';

const BottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  const NAV_ITEMS = [
    { path: '/',            label: 'Home',     Icon: Home       },
    { path: '/my-bookings', label: 'Bookings', Icon: BookOpen   },
    { path: '/#faq',        label: 'Help',     Icon: HelpCircle },
    {
      path: isAuthenticated ? '/my-bookings' : '/login',
      label: 'Account',
      Icon: User,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path.split('#')[0]) && path !== '/';
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="grid grid-cols-4 h-16 safe-area-inset-bottom">
        {NAV_ITEMS.map(({ path, label, Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
              to={path}
              className="flex flex-col items-center justify-center gap-1 transition-all duration-150 active:scale-95"
            >
              {/* Active indicator dot */}
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
      </div>
    </nav>
  );
};

export default BottomNav;