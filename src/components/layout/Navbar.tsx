import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 mr-2 sm:mr-4">
              <div className="flex items-center bg-[#d63031] text-white px-2.5 py-1.5 rounded-xl gap-1.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="8" width="20" height="10" rx="2" fill="white" fillOpacity="0.95"/>
                  <circle cx="6.5" cy="18" r="2" fill="white"/>
                  <circle cx="17.5" cy="18" r="2" fill="white"/>
                  <rect x="4" y="5" width="16" height="5" rx="1" fill="white" fillOpacity="0.75"/>
                  <rect x="5" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                  <rect x="10" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                  <rect x="15" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                </svg>
                <span className="font-black text-sm tracking-tight hidden sm:block">redBus</span>
              </div>
            </Link>
            <div className="flex items-end">
              <Link
                to="/"
                className={cn(
                  'flex items-center gap-1.5 px-3 sm:px-4 pb-1 pt-1 border-b-2 transition-all duration-150',
                  isHome
                    ? 'border-[#d63031] text-[#d63031]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <div className={cn(
                  'p-1 rounded-lg',
                  isHome ? 'bg-red-50' : 'bg-gray-100'
                )}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="2" y="7" width="20" height="12" rx="2"/>
                    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeLinecap="round"/>
                    <circle cx="7" cy="19" r="1.5"/>
                    <circle cx="17" cy="19" r="1.5"/>
                    <path d="M2 13h20" strokeLinecap="round"/>
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Bus tickets</span>
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 sm:px-4 pb-1 pt-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-all duration-150"
              >
                <div className="p-1 rounded-lg bg-gray-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="4" y="3" width="16" height="13" rx="2"/>
                    <path d="M4 9h16M9 16l-2 5M15 16l2 5M2 21h20" strokeLinecap="round"/>
                    <circle cx="8.5" cy="12.5" r="1"/>
                    <circle cx="15.5" cy="12.5" r="1"/>
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-[#d63031] font-bold -mb-1 block" style={{fontSize:'9px'}}>redRail</span>
                  <span className="text-xs sm:text-sm font-semibold whitespace-nowrap leading-none">Train tickets</span>
                </div>
              </Link>
            </div>
          </div>

      
          <div className="hidden sm:flex items-center gap-1">
            <Link to="/my-bookings"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#d63031] hover:bg-red-50 transition-colors">
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:block">Bookings</span>
            </Link>
            <a href="#faq"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#d63031] hover:bg-red-50 transition-colors">
              <HelpCircle className="w-4 h-4" />
              <span className="hidden md:block">Help</span>
            </a>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#d63031] flex items-center justify-center text-white text-xs font-bold">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block max-w-[80px] truncate">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', dropdownOpen ? 'rotate-180' : '')} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-[#1a1a2e]">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link to="/my-bookings" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setDropdownOpen(false)}>
                      <BookOpen className="w-4 h-4 text-gray-400" /> My Bookings
                    </Link>
                    <button onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-[#d63031] hover:bg-red-50 transition-colors">
                <User className="w-4 h-4" />
                <span className="hidden md:block">Account</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;