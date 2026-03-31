import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, HelpCircle, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';
import HelpModal from '@/components/ui/HelpModal';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Section: Logo and Primary Nav */}
            <div className="flex items-center gap-2 sm:gap-6">
              <Link to="/" className="flex-shrink-0">
                <div className="flex items-center bg-[#d63031] text-white px-3 py-2 rounded-xl gap-1.5 transition-transform active:scale-95">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="8" width="20" height="10" rx="2" fill="white" fillOpacity="0.95"/>
                    <circle cx="6.5" cy="18" r="2" fill="white"/>
                    <circle cx="17.5" cy="18" r="2" fill="white"/>
                    <rect x="4" y="5" width="16" height="5" rx="1" fill="white" fillOpacity="0.75"/>
                    <rect x="5" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                    <rect x="10" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                    <rect x="15" y="9.5" width="4" height="3" rx="0.5" fill="#d63031"/>
                  </svg>
                  <span className="font-black text-base tracking-tight hidden xs:block">redBus</span>
                </div>
              </Link>

              <nav className="flex items-end h-16">
                <Link
                  to="/"
                  className={cn(
                    'flex items-center gap-2 px-3 sm:px-4 h-full border-b-2 transition-all duration-150',
                    isHome
                      ? 'border-[#d63031] text-[#d63031]'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  )}
                >
                  <div className={cn(
                    'p-1.5 rounded-lg hidden sm:block',
                    isHome ? 'bg-red-50' : 'bg-gray-100'
                  )}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="7" width="20" height="12" rx="2"/>
                      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                      <circle cx="7" cy="19" r="1.5"/>
                      <circle cx="17" cy="19" r="1.5"/>
                      <path d="M2 13h20" />
                    </svg>
                  </div>
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap pb-1">Bus Tickets</span>
                </Link>

                <Link
                  to="/train-tickets"
                  className="flex items-center gap-2 px-3 sm:px-4 h-full border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-all duration-150"
                >
                </Link>
              </nav>
            </div>

            {/* Right Section: Actions & Auth */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Link to="/my-bookings"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-[#d63031] hover:bg-red-50 transition-colors">
                <BookOpen className="w-4 h-4" />
                <span className="hidden lg:block">My Bookings</span>
              </Link>
              
              <button onClick={() => setHelpOpen(true)}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-[#d63031] hover:bg-red-50 transition-colors">
                <HelpCircle className="w-4 h-4" />
                <span className="hidden lg:block">Help</span>
              </button>

              <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block" />

              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1.5 rounded-full hover:bg-gray-100 transition-colors border border-transparent active:border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-[#d63031] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {(user?.name ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform duration-200', dropdownOpen ? 'rotate-180' : '')} />
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[60] animate-in fade-in zoom-in duration-150">
                      <div className="px-4 py-3 mb-1 border-b border-gray-50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name ?? 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email ?? ''}</p>
                      </div>
                      <Link to="/my-bookings" 
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setDropdownOpen(false)}>
                        <BookOpen className="w-4 h-4 text-gray-400" /> My Bookings
                      </Link>
                      <button 
                        onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-bold bg-gray-900 text-white hover:bg-gray-800 transition-all active:scale-95">
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
    </>
  );
};

export default Navbar;